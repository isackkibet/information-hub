"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/status-badge";
import { clearSession } from "@/lib/auth";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/components/ui/toast";
import { User, Bell, Globe, Palette, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { session, loading } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem("sihu_token");
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Unable to update profile");
      localStorage.setItem("sihu_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("sihu-auth-change"));
      setName("");
      toast("Profile updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Unable to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold">Sign-in required</h1>
        <p className="text-muted-foreground">Please sign in to access settings.</p>
        <Link href="/sign-in?redirect=%2Faccount%2Fsettings">
          <Button className="mt-3">Go to Sign in</Button>
        </Link>
      </div>
    );
  }

  const signOut = () => {
    clearSession();
    toast("Signed out", "info");
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>

        {/* Profile */}
        <Card className="mt-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <p className="font-medium">Profile</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-teal-500 text-xl font-semibold text-white">
                {session.user?.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                <div className="mt-1">
                  {session.user && <RoleBadge role={session.user.role} />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display name */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name || session.user?.name || ""}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Your display name is used across the workspace.</p>
            <Button
              className="mt-3"
              size="sm"
              disabled={savingProfile || !name.trim() || name.trim() === session.user?.name}
              onClick={saveProfile}
            >
              {savingProfile ? "Saving…" : "Save name"}
            </Button>
          </CardContent>
        </Card>

        {/* Language preferences */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <p className="font-medium">Language preferences</p>
            </div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" /> English
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" /> Kiswahili
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Interface language. Article listening languages are separate.</p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <p className="font-medium">Notification preferences</p>
            </div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" /> Editorial review assignments
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded" /> Verification queue updates
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" /> Email notifications (not configured)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <p className="font-medium">Appearance</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the theme toggle in the header to switch between light and dark mode.
            </p>
          </CardContent>
        </Card>

        {/* Security note */}
        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <p className="font-medium">Security</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You are signed in via a local session stored in your browser.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Button className="mt-6" onClick={() => toast("Settings saved", "success")}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
