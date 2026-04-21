import { Role, Permission } from "../types";

const ROLE_PERMISSIONS: Record<Role, Permission> = {
  admin: {
    createTask: true,
    editTask: true,
    deleteTask: true,
    assignTask: true,
    inviteMember: true,
    removeMember: true,
    changeRole: true,
    deleteTeam: true,
  },
  manager: {
    createTask: true,
    editTask: true,
    deleteTask: true,
    assignTask: true,
    inviteMember: true,
    removeMember: false,
    changeRole: false,
    deleteTeam: false,
  },
  member: {
    createTask: true,
    editTask: true,
    deleteTask: false,
    assignTask: false,
    inviteMember: false,
    removeMember: false,
    changeRole: false,
    deleteTeam: false,
  },
  viewer: {
    createTask: false,
    editTask: false,
    deleteTask: false,
    assignTask: false,
    inviteMember: false,
    removeMember: false,
    changeRole: false,
    deleteTeam: false,
  },
};

export function getPermissions(role: Role): Permission {
  return ROLE_PERMISSIONS[role];
}

export function can(role: Role, action: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][action];
}
