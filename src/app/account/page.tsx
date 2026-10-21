"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { getNavForRole } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { session, loading } = useSession();
  const nav = getNavForRole(session.user?.role);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!session.isAuthenticated) return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold">Sign-in required</h1>
      <p className="text-muted-foreground">Please sign in to access your account.</p>
      <Link href="/sign-in"><Button className="mt-3">Go to Sign in</Button></Link>
    </div>
  );
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">My Account</h1>
      <p className="text-muted-foreground">{session.user?.name} • {session.user?.email} • {session.user?.role}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/account/settings"><Card className="transition hover:shadow-md"><CardContent className="p-4"><p className="font-medium">Settings</p><p className="text-sm text-muted-foreground">Profile & preferences</p></CardContent></Card></Link>
        <Link href="/account/library"><Card className="transition hover:shadow-md"><CardContent className="p-4"><p className="font-medium">My Library</p><p className="text-sm text-muted-foreground">Saved articles</p></CardContent></Card></Link>
        <Link href="/account/submissions"><Card className="transition hover:shadow-md"><CardContent className="p-4"><p className="font-medium">My Submissions</p><p className="text-sm text-muted-foreground">Reports & articles</p></CardContent></Card></Link>
        <Link href="/account/tasks"><Card className="transition hover:shadow-md"><CardContent className="p-4"><p className="font-medium">My Tasks</p><p className="text-sm text-muted-foreground">Assigned work</p></CardContent></Card></Link>
      </div>
      {(nav.showEditorial || nav.showVerification || nav.showAdmin) && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Workspaces</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {nav.showEditorial && <Link href="/editorial"><Button variant="outline">Editorial Desk</Button></Link>}
            {nav.showVerification && <Link href="/verification"><Button variant="outline">Verification Queue</Button></Link>}
            {nav.showAdmin && <Link href="/admin"><Button variant="outline">Admin Console</Button></Link>}
          </div>
        </div>
      )}
    </div>
  );
}
