import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Task, TaskPriority, TaskStatus } from "../types";

/**
 * 一方向同期（Task → Googleカレンダー）。
 *
 * dueDate を持つタスクをGoogleカレンダーのイベントとして書き出す。
 * - 未同期のタスク … イベントを新規作成
 * - 同期済みのタスク … 既存イベントを更新
 * - dueDate が外れた / 削除されたタスク … イベントを削除
 *
 * タスクIDとイベントIDの対応は CalendarSyncStore に保持する。
 * 永続化が必要な場合は CalendarSyncStore を実装して差し替える。
 */

/** タスクID → カレンダーのイベントID の対応を保持するストア */
export interface CalendarSyncStore {
  get(taskId: string): string | undefined;
  set(taskId: string, eventId: string): void;
  delete(taskId: string): void;
}

/** プロセス内に対応を保持するだけの簡易ストア（永続化なし） */
export class InMemorySyncStore implements CalendarSyncStore {
  private map = new Map<string, string>();

  get(taskId: string): string | undefined {
    return this.map.get(taskId);
  }

  set(taskId: string, eventId: string): void {
    this.map.set(taskId, eventId);
  }

  delete(taskId: string): void {
    this.map.delete(taskId);
  }
}

/** 優先度ごとのイベント色（Googleカレンダーの colorId） */
const PRIORITY_COLOR_ID: Record<TaskPriority, string> = {
  high: "11", // Tomato（赤）
  medium: "5", // Banana（黄）
  low: "2", // Sage（緑）
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export interface GoogleCalendarSyncOptions {
  /** 書き込み先のカレンダーID（デフォルト: "primary"） */
  calendarId?: string;
  /** タスクID↔イベントID の対応ストア（デフォルト: InMemorySyncStore） */
  store?: CalendarSyncStore;
  /** dueDate を終点としたイベントの長さ（分。デフォルト: 30） */
  defaultDurationMinutes?: number;
}

export class GoogleCalendarSync {
  private readonly calendar: calendar_v3.Calendar;
  private readonly calendarId: string;
  private readonly store: CalendarSyncStore;
  private readonly durationMs: number;

  constructor(auth: OAuth2Client, options: GoogleCalendarSyncOptions = {}) {
    this.calendar = google.calendar({ version: "v3", auth });
    this.calendarId = options.calendarId ?? "primary";
    this.store = options.store ?? new InMemorySyncStore();
    this.durationMs = (options.defaultDurationMinutes ?? 30) * 60 * 1000;
  }

  /**
   * タスク1件をカレンダーへ反映する。
   * @returns 作成/更新したイベントID。dueDate が無く同期対象外なら null。
   */
  async syncTask(task: Task): Promise<string | null> {
    const existingEventId = this.store.get(task.id);

    // dueDate が無ければカレンダーに置けない。既存イベントがあれば消す。
    if (!task.dueDate) {
      if (existingEventId) {
        await this.removeTask(task.id);
      }
      return null;
    }

    const requestBody = this.taskToEvent(task);

    if (existingEventId) {
      await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: existingEventId,
        requestBody,
      });
      return existingEventId;
    }

    const res = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody,
    });
    const eventId = res.data.id;
    if (!eventId) {
      throw new Error("Google Calendar did not return an event id");
    }
    this.store.set(task.id, eventId);
    return eventId;
  }

  /** 複数タスクをまとめて同期する。 */
  async syncTasks(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.syncTask(task);
    }
  }

  /** タスクに対応するイベントを削除する（タスク削除時に呼ぶ）。 */
  async removeTask(taskId: string): Promise<void> {
    const eventId = this.store.get(taskId);
    if (!eventId) return;

    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (err) {
      // 既にカレンダー側で消えている（404）場合は無視して整合させる。
      if (!isNotFoundError(err)) throw err;
    }
    this.store.delete(taskId);
  }

  /** Task をカレンダーイベントのリクエストボディに変換する。 */
  private taskToEvent(task: Task): calendar_v3.Schema$Event {
    const start = task.dueDate as Date;
    const end = new Date(start.getTime() + this.durationMs);

    const description = [
      task.description,
      `Status: ${STATUS_LABEL[task.status]}`,
      `Priority: ${task.priority}`,
      `Task ID: ${task.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      summary: task.status === "done" ? `✓ ${task.title}` : task.title,
      description,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      colorId: PRIORITY_COLOR_ID[task.priority],
      // 紐付けを残しておくと、ストアが失われても突き合わせで復元できる。
      extendedProperties: {
        private: { taskId: task.id, teamId: task.teamId },
      },
    };
  }
}

export interface OAuthClientOptions {
  clientId: string;
  clientSecret: string;
  /** 事前に取得済みのリフレッシュトークン */
  refreshToken: string;
  redirectUri?: string;
}

/**
 * リフレッシュトークンから認証済みの OAuth2 クライアントを作る。
 * アクセストークンは googleapis が必要に応じて自動更新する。
 */
export function createOAuthClient(opts: OAuthClientOptions): OAuth2Client {
  const client = new google.auth.OAuth2(
    opts.clientId,
    opts.clientSecret,
    opts.redirectUri
  );
  client.setCredentials({ refresh_token: opts.refreshToken });
  return client;
}

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 404
  );
}
