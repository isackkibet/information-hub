"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserCircle, Sun, Moon, ChevronDown } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/auth";
import { getNavForRole } from "@/lib/permissions";
import { useSession } from "@/hooks/use-session";

// Isolated inside Suspense — uses usePathname which is a dynamic hook
function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`)) ? "page" : undefined}
          className={`whitespace-nowrap rounded-md px-2.5 py-2 text-sm transition-colors ${pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`)) ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          {l.label}
        </Link>
      ))}
    </>
  );
}

function HeaderInner() {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  const nav = getNavForRole(session.user?.role);
  const adminHref = session.isAuthenticated ? "/admin" : "/sign-in?redirect=%2Fadmin";

  const links = [
    { href: "/", label: "Home" },
    { href: "/portal/media", label: "Media Content" },
    { href: "/portal", label: "Portal" },
    { href: "/ai-assistant", label: "AI Assistant" },
    { href: "/submit", label: "Submit a Report" },
    { href: adminHref, label: "Admin Portal" },
  ].filter(Boolean) as { href: string; label: string }[];

  const workspaceLinks = [
    nav.showEditorial ? { href: "/editorial", label: "Editorial Desk" } : null,
    nav.showVerification ? { href: "/verification", label: "Verification Queue" } : null,
    nav.showLeadership ? { href: "/leadership", label: "Leadership Summary" } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-4 2xl:gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-gradient-to-br from-cyan-600 to-teal-500" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold tracking-wide">SANGO INFORMATION HUB</span>
              <span className="hidden text-xs text-muted-foreground 2xl:block">We care about Lake Victoria.</span>
            </div>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
            <Suspense fallback={null}>
              <NavLinks links={links} />
            </Suspense>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {session.isAuthenticated && session.user ? (
            <div className="hidden items-center gap-1 xl:flex">
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <UserCircle className="h-4 w-4" />
                  <span className="max-w-28 truncate">{session.user.name}</span>
                </Button>
              </Link>
              {workspaceLinks.length > 0 && (
                <details className="group relative">
                  <summary className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
                    Workspaces <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-48 rounded-md border border-border bg-background p-1 shadow-lg">
                    {workspaceLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="block rounded px-3 py-2 text-sm hover:bg-muted">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </details>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSession()}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Link className="hidden xl:block" href="/sign-in"><Button size="sm">Sign in</Button></Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
          >
            {open ? <span className="text-lg leading-none">×</span> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border xl:hidden">
          <nav aria-label="Mobile navigation" className="container mx-auto flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">{l.label}</Link>
            ))}
            {workspaceLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">{item.label}</Link>
            ))}
            {session.isAuthenticated && session.user ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">My Account</Link>
                <button
                  className="rounded px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { clearSession(); setOpen(false); }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur h-16" />
    }>
      <HeaderInner />
    </Suspense>
  );
}
