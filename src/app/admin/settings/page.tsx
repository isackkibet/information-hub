"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Settings = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactLocation: string;
};

const DEFAULTS: Settings = {
  siteName: "Sango Information Hub (SIHU)",
  tagline: "We care about Lake Victoria.",
  contactEmail: "",
  contactLocation: "Lake Victoria Basin, Kenya",
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("sihu_token") ?? ""}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Unable to load the settings");
        if (active) setSettings({ ...DEFAULTS, ...(data?.settings ?? {}) });
      })
      .catch((error: Error) => {
        if (active) toast(error.message, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sihu_token") ?? ""}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to save the settings");
      if (data?.settings) setSettings({ ...DEFAULTS, ...data.settings });
      toast("Settings saved", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to save the settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Site Settings</h1>
      <p className="text-muted-foreground">
        Site name, tagline, contact, branding, navigation, content, notifications. No secret keys exposed.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="font-medium">General</p>
            <div>
              <Label htmlFor="site-name">Site name</Label>
              <Input
                id="site-name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="font-medium">Contact</p>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="contact@sihu.org"
              />
            </div>
            <div>
              <Label htmlFor="contact-loc">Location</Label>
              <Input
                id="contact-loc"
                value={settings.contactLocation}
                onChange={(e) => setSettings({ ...settings, contactLocation: e.target.value })}
                placeholder="Lake Victoria Basin, Kenya"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="font-medium">Branding</p>
            <p className="text-sm text-muted-foreground">Logo and colors are configured via the theme system. Brand color: deep lake-blue and teal inspired by Lake Victoria.</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-cyan-600" />
              <div className="h-8 w-8 rounded-md bg-teal-500" />
              <div className="h-8 w-8 rounded-md bg-sky-500" />
              <span className="text-xs text-muted-foreground">Primary palette</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="font-medium">Content & Notification Preferences</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" /> Show featured stories on Portal
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" /> Enable community reporting
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" /> Email notifications (not configured)
            </label>
          </CardContent>
        </Card>
      </div>

      <Button className="mt-4" disabled={saving || loading} onClick={() => void save()}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );
}
