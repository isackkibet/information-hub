"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, FileText, Folder, Settings, ClipboardList, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: Folder },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/audit", label: "Audit", icon: ClipboardList },
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
            <p className="px-2 text-sm font-medium">Admin Portal</p>
            <p className="px-2 text-xs text-muted-foreground">Administrator demo workspace</p>
            <nav aria-label="Admin navigation" className="mt-2 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                    isActive(link.href) && "bg-muted font-medium text-primary"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
