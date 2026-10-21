import { Role as DbRole, UserStatus as DbUserStatus } from "@/generated/prisma/enums";
import type { AccountStatus, Role } from "@/types";

export const DB_TO_ROLE: Record<DbRole, Role> = {
  REGISTERED_USER: "Registered User",
  CONTRIBUTOR: "Contributor",
  VERIFIER: "Verifier",
  EDITOR: "Editor",
  LEADERSHIP: "Leadership",
  ADMINISTRATOR: "Administrator",
};

export const ROLE_TO_DB: Record<Exclude<Role, "Visitor">, DbRole> = {
  "Registered User": "REGISTERED_USER",
  Contributor: "CONTRIBUTOR",
  Verifier: "VERIFIER",
  Editor: "EDITOR",
  Leadership: "LEADERSHIP",
  Administrator: "ADMINISTRATOR",
};

export const DB_TO_STATUS: Record<DbUserStatus, AccountStatus> = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
};

export function toRole(dbRole: DbRole | string): Role {
  return DB_TO_ROLE[dbRole as DbRole] ?? "Registered User";
}

export function toUserStatus(dbStatus: DbUserStatus | string): AccountStatus {
  return DB_TO_STATUS[dbStatus as DbUserStatus] ?? "active";
}

export function toDbRole(role: Role): DbRole {
  return ROLE_TO_DB[role as Exclude<Role, "Visitor">] ?? "REGISTERED_USER";
}
