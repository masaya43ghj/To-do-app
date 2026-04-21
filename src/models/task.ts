import { Task, TaskStatus, TaskPriority } from "../types";
import { can } from "../services/permissions";
import { getMemberRole } from "./team";
import { Team } from "../types";

export function createTask(
  id: string,
  title: string,
  teamId: string,
  createdBy: string,
  team: Team,
  options: { description?: string; priority?: TaskPriority; assigneeId?: string; dueDate?: Date } = {}
): Task {
  const role = getMemberRole(team, createdBy);
  if (!role || !can(role, "createTask")) {
    throw new Error("Permission denied: cannot create task");
  }

  return {
    id,
    title,
    description: options.description,
    status: "todo",
    priority: options.priority ?? "medium",
    teamId,
    assigneeId: options.assigneeId,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: options.dueDate,
  };
}

export function updateTaskStatus(task: Task, newStatus: TaskStatus, userId: string, team: Team): Task {
  const role = getMemberRole(team, userId);
  if (!role || !can(role, "editTask")) {
    throw new Error("Permission denied: cannot edit task");
  }

  return { ...task, status: newStatus, updatedAt: new Date() };
}

export function deleteTask(task: Task, userId: string, team: Team): void {
  const role = getMemberRole(team, userId);
  if (!role || !can(role, "deleteTask")) {
    throw new Error("Permission denied: cannot delete task");
  }
}

export function assignTask(task: Task, assigneeId: string, userId: string, team: Team): Task {
  const role = getMemberRole(team, userId);
  if (!role || !can(role, "assignTask")) {
    throw new Error("Permission denied: cannot assign task");
  }

  return { ...task, assigneeId, updatedAt: new Date() };
}
