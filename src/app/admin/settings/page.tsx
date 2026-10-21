"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("Sango Information Hub (SIHU)");
  const [tagline, setTagline] = useState("We care about Lake Victoria.");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLocation, setContactLocation] = useState("");

  const save = () => {
    toast("Settings saved (demo — not persisted)", "success");
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
              <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="font-medium">Contact (Demo)</p>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@sihu.org (demo)" />
            </div>
            <div>
              <Label htmlFor="contact-loc">Location</Label>
              <Input id="contact-loc" value={contactLocation} onChange={(e) => setContactLocation(e.target.value)} placeholder="Lake Victoria Basin, Kenya (demo)" />
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

      <Button className="mt-4" onClick={save}>Save settings</Button>
    </div>
  );
}
