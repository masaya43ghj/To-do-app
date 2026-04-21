export type Role = "admin" | "manager" | "member" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface TeamMember {
  user: User;
  role: Role;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: Date;
  createdBy: string; // user id
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  teamId: string;
  assigneeId?: string; // user id
  createdBy: string;  // user id
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface Permission {
  createTask: boolean;
  editTask: boolean;
  deleteTask: boolean;
  assignTask: boolean;
  inviteMember: boolean;
  removeMember: boolean;
  changeRole: boolean;
  deleteTeam: boolean;
}
