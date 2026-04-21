import { Team, TeamMember, User, Role } from "../types";

export function createTeam(id: string, name: string, creator: User, description?: string): Team {
  return {
    id,
    name,
    description,
    members: [{ user: creator, role: "admin", joinedAt: new Date() }],
    createdAt: new Date(),
    createdBy: creator.id,
  };
}

export function addMember(team: Team, user: User, role: Role): Team {
  const already = team.members.find((m) => m.user.id === user.id);
  if (already) throw new Error(`${user.name} is already a member`);

  return {
    ...team,
    members: [...team.members, { user, role, joinedAt: new Date() }],
  };
}

export function removeMember(team: Team, userId: string): Team {
  const member = team.members.find((m) => m.user.id === userId);
  if (!member) throw new Error("Member not found");
  if (member.role === "admin" && adminCount(team) === 1) {
    throw new Error("Cannot remove the last admin");
  }

  return { ...team, members: team.members.filter((m) => m.user.id !== userId) };
}

export function changeRole(team: Team, userId: string, newRole: Role): Team {
  const member = team.members.find((m) => m.user.id === userId);
  if (!member) throw new Error("Member not found");
  if (member.role === "admin" && newRole !== "admin" && adminCount(team) === 1) {
    throw new Error("Cannot demote the last admin");
  }

  return {
    ...team,
    members: team.members.map((m) =>
      m.user.id === userId ? { ...m, role: newRole } : m
    ),
  };
}

export function getMemberRole(team: Team, userId: string): Role | undefined {
  return team.members.find((m) => m.user.id === userId)?.role;
}

function adminCount(team: Team): number {
  return team.members.filter((m) => m.role === "admin").length;
}
