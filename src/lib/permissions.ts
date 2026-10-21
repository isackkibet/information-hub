import { Role } from "@/types";

export const roleHierarchy: Role[] = [
  "Visitor",
  "Registered User",
  "Contributor",
  "Editor",
  "Verifier",
  "Administrator",
  "Leadership",
];

export function hasRole(userRole: Role | undefined, required: Role[]): boolean {
  if (!userRole) return false;
  return required.includes(userRole);
}

export function canAccessAdmin(role?: Role) {
  return role === "Administrator";
}

export function canAccessEditorial(role?: Role) {
  return role === "Editor" || role === "Administrator";
}

export function canAccessVerification(role?: Role) {
  return role === "Verifier" || role === "Administrator";
}

export function canAccessLeadership(role?: Role) {
  return role === "Leadership" || role === "Administrator";
}

export function canSubmitReport(role?: Role) {
  return role === "Registered User" || role === "Contributor" || role === "Editor" || role === "Verifier" || role === "Administrator" || role === "Leadership";
}

export function canPublish(role?: Role) {
  return role === "Editor" || role === "Administrator";
}

export function canManageUsers(role?: Role) {
  return role === "Administrator";
}

export function canManageCategories(role?: Role) {
  return role === "Administrator";
}

export function getNavForRole(role?: Role) {
  return {
    showPortal: !!role,
    showAi: !!role,
    showSubmit: canSubmitReport(role),
    showEditorial: canAccessEditorial(role),
    showVerification: canAccessVerification(role),
    showLeadership: canAccessLeadership(role),
    showAdmin: canAccessAdmin(role),
    showAccount: !!role,
  };
}
