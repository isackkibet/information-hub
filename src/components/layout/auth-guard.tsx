"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { canAccessAdmin, canAccessEditorial, canAccessVerification } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ShieldX, LogIn } from "lucide-react";
import type { Role } from "@/types";

type GuardType = "auth" | "admin" | "editorial" | "verification";

function checkAccess(role: Role | undefined, type: GuardType): boolean {
  switch (type) {
    case "auth": return !!role;
    case "admin": return canAccessAdmin(role);
    case "editorial": return canAccessEditorial(role);
    case "verification": return canAccessVerification(role);
    default: return false;
  }
}

function SignInRequired({ redirect }: { redirect: string }) {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/50">
            <Lock className="h-6 w-6 text-cyan-600" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Sign-in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to sign in to access this page. Signed-out users can view the Home page only.
          </p>
          <Link href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}>
            <Button className="mt-4 w-full">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </Link>
          <Link href="/" className="mt-2 block text-sm text-muted-foreground hover:underline">
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function AccessDenied({ requiredRole, redirect }: { requiredRole: string; redirect?: string }) {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50">
            <ShieldX className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your current role does not have permission to access this area. This workspace requires the{" "}
            <span className="font-medium">{requiredRole}</span> role or higher.
          </p>
          <Link href="/account">
            <Button className="mt-4 w-full" variant="outline">Go to My Account</Button>
          </Link>
          <Link href={redirect ? `/sign-in?redirect=${encodeURIComponent(redirect)}` : "/sign-in"} className="mt-2 block text-sm text-muted-foreground hover:underline">
            Switch account
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthGuard({
  children,
  type = "auth",
  requiredRole,
}: {
  children: React.ReactNode;
  type?: GuardType;
  requiredRole?: string;
}) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!session.isAuthenticated) {
    const redirect = typeof window !== "undefined" ? window.location.pathname : "/";
    return <SignInRequired redirect={redirect} />;
  }

  if (!checkAccess(session.user?.role, type)) {
    const roleLabel = type === "admin" ? "Administrator" : type === "editorial" ? "Editor" : type === "verification" ? "Verifier" : "Registered User";
    return <AccessDenied requiredRole={requiredRole || roleLabel} redirect={type === "admin" ? "/admin" : undefined} />;
  }

  return <>{children}</>;
}
