import AdminLayoutClient from "./admin-layout-client";

// Admin access depends on the session role stored in the browser, so this subtree
// cannot be validated as a fully server-rendered instant-navigation segment.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
