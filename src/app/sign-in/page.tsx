"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { LogIn, UserPlus } from "lucide-react";

type Mode = "signin" | "signup";

function getInternalRedirect(value: string | null): string {
  if (!value) return "/account";
  try {
    const target = new URL(value, "https://sihu.invalid");
    if (target.origin !== "https://sihu.invalid") return "/account";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/account";
  }
}

function SignInContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = getInternalRedirect(sp.get("redirect"));
  const requestedRedirect = sp.get("redirect");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const user = await login(email.trim(), password);
        toast("Signed in successfully", "success");
        router.push(requestedRedirect ? redirectTo : user.role === "Administrator" ? "/admin" : redirectTo);
      } else {
        await register(name.trim(), email.trim(), password);
        toast("Account created", "success");
        router.push(redirectTo);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setName("");
    setPassword("");
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold">
            {mode === "signin" ? "Sign in to SIHU" : "Create your SIHU account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the Portal, AI Assistant and role-based workspaces.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <Button
              type="button"
              size="sm"
              variant={mode === "signin" ? "default" : "ghost"}
              onClick={() => switchMode("signin")}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "signup" ? "default" : "ghost"}
              onClick={() => switchMode("signup")}
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </Button>
          </div>

          <form onSubmit={submit} className="mt-4 space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : undefined}
                maxLength={72}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Sign in with the email and password for your account. New sign-ups become Registered Users; admin accounts are provisioned by the site owner.
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium">Administrator?</p>
            <p className="mt-1 text-xs text-muted-foreground">Use the same sign-in form with your administrator account.</p>
            <Link href="/sign-in?redirect=%2Fadmin" className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted">
              Admin Portal sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
