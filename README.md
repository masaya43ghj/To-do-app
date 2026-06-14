# To-do App

チームで使えるTo-doアプリです。メンバーに役割を割り当てることで、操作権限を管理できます。

## チームの役割

| 役割 | 説明 |
|------|------|
| **Admin（管理者）** | チームの全権限を持つ。メンバーの招待・削除・役割変更、チームの削除が可能 |
| **Manager（マネージャー）** | タスクの作成・編集・削除・アサイン、メンバーの招待が可能 |
| **Member（メンバー）** | タスクの作成・編集が可能 |
| **Viewer（閲覧者）** | タスクの閲覧のみ可能 |

## 権限一覧

| 操作 | Admin | Manager | Member | Viewer |
|------|:-----:|:-------:|:------:|:------:|
| タスク作成 | ✅ | ✅ | ✅ | ❌ |
| タスク編集 | ✅ | ✅ | ✅ | ❌ |
| タスク削除 | ✅ | ✅ | ❌ | ❌ |
| タスクアサイン | ✅ | ✅ | ❌ | ❌ |
| メンバー招待 | ✅ | ✅ | ❌ | ❌ |
| メンバー削除 | ✅ | ❌ | ❌ | ❌ |
| 役割変更 | ✅ | ❌ | ❌ | ❌ |
| チーム削除 | ✅ | ❌ | ❌ | ❌ |

## プロジェクト構成

```
src/
├── types/
│   └── index.ts          # 型定義（Role, User, Team, Task）
├── models/
│   ├── team.ts           # チーム操作（メンバー追加・削除・役割変更）
│   └── task.ts           # タスク操作（作成・更新・削除・アサイン）
└── services/
    ├── permissions.ts    # 役割ごとの権限定義
    └── googleCalendar.ts # Googleカレンダー連携（一方向同期）
```

## 使い方（例）

```typescript
import { createTeam, addMember } from "./src/models/team";
import { createTask, updateTaskStatus } from "./src/models/task";

const admin: User = { id: "u1", name: "Alice", email: "alice@example.com", createdAt: new Date() };
const member: User = { id: "u2", name: "Bob", email: "bob@example.com", createdAt: new Date() };

// チーム作成（作成者はadminになる）
let team = createTeam("t1", "開発チーム", admin);

// メンバー追加
team = addMember(team, member, "member");

// タスク作成（memberは作成可能）
const task = createTask("task1", "ログイン機能の実装", team.id, member.id, team);

// ステータス更新
const updated = updateTaskStatus(task, "in_progress", member.id, team);
```

## Googleカレンダー連携（一方向同期）

`dueDate`（締切日）を持つタスクを、Googleカレンダーのイベントとして書き出します。
タスク → カレンダーの**一方向同期**です（カレンダー側の変更はタスクに反映されません）。

| タスクの状態 | カレンダーへの反映 |
|------|------|
| `dueDate` あり・未同期 | イベントを新規作成 |
| `dueDate` あり・同期済み | 既存イベントを更新 |
| `dueDate` なし / タスク削除 | イベントを削除 |

イベントには優先度ごとの色（high=赤 / medium=黄 / low=緑）が付き、完了タスクは
タイトルに `✓` が付きます。

### 事前準備

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成し、
   **Google Calendar API** を有効化する
2. OAuth 2.0 クライアントID（クライアントID・クライアントシークレット）を作成する
3. ユーザーごとに同意フローを通して**リフレッシュトークン**を取得する
4. 依存をインストールする: `npm install`

### 使い方（例）

```typescript
import { createOAuthClient, GoogleCalendarSync } from "./src/services/googleCalendar";

// 認証済みクライアントを作成（リフレッシュトークンから）
const auth = createOAuthClient({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
});

const sync = new GoogleCalendarSync(auth, { calendarId: "primary" });

// タスクをカレンダーへ反映（作成 or 更新）
await sync.syncTask(task);

// タスク削除時はカレンダーのイベントも削除
await sync.removeTask(task.id);
```

> タスクIDとイベントIDの対応はデフォルトでプロセス内（メモリ）に保持されます。
> DB等に永続化したい場合は `CalendarSyncStore` を実装して
> `new GoogleCalendarSync(auth, { store })` に渡してください。
