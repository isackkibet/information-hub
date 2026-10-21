"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, FileText, Folder, Settings, ClipboardList, Menu, X, Images, ClipboardCheck, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groups = [
    { label: "Overview", links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ] },
    { label: "Content", links: [
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/media", label: "Media Content", icon: Images },
      { href: "/admin/categories", label: "Categories", icon: Folder },
    ] },
    { label: "Review work", links: [
      { href: "/editorial", label: "Editorial Review", icon: ClipboardCheck },
      { href: "/verification", label: "Verify Reports", icon: FileSearch },
    ] },
    { label: "Platform", links: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/audit", label: "Audit Log", icon: ClipboardList },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ] },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <AuthGuard type="admin">
      <div className="container mx-auto px-4 py-6">
        <button
          className="mb-4 flex items-center gap-2 text-sm font-medium md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Admin menu
        </button>

        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className={cn(
              "rounded-lg border border-border p-3",
              sidebarOpen ? "block" : "hidden md:block"
            )}
          >
            <p className="px-2 text-sm font-semibold">Admin Portal</p>
            <p className="px-2 text-xs text-muted-foreground">Content and platform tools</p>
            <nav aria-label="Admin navigation" className="mt-4 space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                          isActive(link.href) && "bg-primary/10 font-medium text-primary"
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
