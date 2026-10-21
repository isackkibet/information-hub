"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { getNavForRole } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ClipboardList, ImagePlus, Library, Settings, Sparkles } from "lucide-react";

const memberLinks = [
  { href: "/portal/media", title: "Browse Media Content", description: "Read articles and explore videos, podcasts, and photos.", icon: BookOpen },
  { href: "/submit", title: "Share a report or photo", description: "Tell us what is happening in your community. Add a photo if you have one.", icon: ImagePlus, featured: true },
  { href: "/account/submissions", title: "Track my submissions", description: "Check the status of reports and articles you have sent.", icon: ClipboardList },
  { href: "/account/library", title: "My saved items", description: "Return to articles you saved for later.", icon: Library },
  { href: "/account/tasks", title: "My tasks", description: "See work assigned to your account.", icon: Sparkles },
  { href: "/account/settings", title: "Profile and settings", description: "Update your profile and preferences.", icon: Settings },
];

export default function AccountPage() {
  const { session, loading } = useSession();
  const nav = getNavForRole(session.user?.role);

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><div className="h-8 w-48 animate-pulse rounded bg-muted" /></div>;
  }

  if (!session.isAuthenticated) return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold">Sign-in required</h1>
      <p className="text-muted-foreground">Please sign in to access your member portal.</p>
      <Link href="/sign-in"><Button className="mt-3">Go to Sign in</Button></Link>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <p className="text-sm font-medium text-primary">Member Portal</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back{session.user?.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Your reading, community contributions, saved items, and account tools are all here.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/submit"><Button><ImagePlus className="mr-2 h-4 w-4" />Share a report or photo</Button></Link>
          <Link href="/portal/media"><Button variant="outline">Explore Media Content<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="member-actions-heading">
        <div className="mb-4">
          <h2 id="member-actions-heading" className="text-xl font-semibold">Your shortcuts</h2>
          <p className="text-sm text-muted-foreground">Choose what you want to do. You can add a photo when submitting a report.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberLinks.map(({ href, title, description, icon: Icon, featured }) => (
            <Link key={href} href={href} className="group">
              <Card className={`h-full transition hover:-translate-y-0.5 hover:shadow-md ${featured ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
                <CardContent className="flex h-full gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="font-semibold group-hover:text-primary">{title}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
                  </span>
                  <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {(nav.showEditorial || nav.showVerification || nav.showAdmin) && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Staff workspaces</h2>
          <p className="text-sm text-muted-foreground">Additional tools available for your role.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nav.showEditorial && <Link href="/editorial"><Button variant="outline">Editorial Desk</Button></Link>}
            {nav.showVerification && <Link href="/verification"><Button variant="outline">Verification Queue</Button></Link>}
            {nav.showAdmin && <Link href="/admin"><Button variant="outline">Admin Console</Button></Link>}
          </div>
        </section>
      )}
    </main>
  );
}
