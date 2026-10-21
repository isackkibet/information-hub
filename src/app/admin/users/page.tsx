import AdminUsersClient from "./users-client";

// This page is hidden until the browser session confirms an administrator role.
// Its navigation is intentionally allowed to wait for that client-side check.
export const instant = false;

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
