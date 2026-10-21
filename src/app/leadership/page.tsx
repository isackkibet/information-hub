"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/ui/status-badge";
import { articles, reports, users, auditEvents } from "@/data";
import { formatDate } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { canAccessAdmin, canAccessEditorial, canAccessVerification } from "@/lib/permissions";
import { BarChart3, FileText, Users, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LeadershipPage() {
  const { session, loading } = useSession();

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
        <p className="text-muted-foreground">Please sign in to access the Leadership workspace.</p>
        <Link href="/sign-in?redirect=%2Fleadership">
          <Button className="mt-3">Go to Sign in</Button>
        </Link>
      </div>
    );
  }

  // Only Leadership and Administrator roles see this
  if (session.user?.role !== "Leadership" && session.user?.role !== "Administrator") {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50">
              <ShieldCheck className="h-6 w-6 text-rose-600" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The Leadership workspace requires the Leadership role. Use the demo sign-in switcher to preview.
            </p>
            <Link href="/sign-in"><Button className="mt-4" variant="outline">Switch role (demo)</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Compute summaries from mock data
  const published = articles.filter((a) => a.status === "published").length;
  const pendingReview = articles.filter((a) => ["submitted", "in_review", "changes_requested"].includes(a.status)).length;
  const pendingVerification = reports.filter((r) => ["submitted", "under_review", "needs_info"].includes(r.status)).length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  // Articles by category
  const byCategory = [
    { name: "Environment & Conservation", count: articles.filter((a) => a.categorySlug === "environment-conservation" && a.status === "published").length },
    { name: "Blue Economy", count: articles.filter((a) => a.categorySlug === "blue-economy" && a.status === "published").length },
    { name: "Community Development", count: articles.filter((a) => a.categorySlug === "community-development" && a.status === "published").length },
    { name: "Human Rights", count: articles.filter((a) => a.categorySlug === "human-rights" && a.status === "published").length },
  ];

  const recentActivity = auditEvents.slice(0, 5);

  const stats = [
    { label: "Published articles", value: published, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
    { label: "Pending editorial review", value: pendingReview, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/50" },
    { label: "Pending verification", value: pendingVerification, icon: AlertTriangle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/50" },
    { label: "Active users", value: activeUsers, icon: Users, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/50" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Leadership Summary</h1>
        <p className="text-muted-foreground">
          Operational summaries from SIHU demonstration data. Permitted overview only — no sensitive data,
          private identities, or internal notes are exposed here.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Mock data (demo)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Articles by category */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="font-medium">Published articles by topic</p>
          <div className="mt-4 space-y-3">
            {byCategory.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">{c.count} articles</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-teal-500"
                    style={{ width: `${(c.count / articles.filter(a => a.status === "published").length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="font-medium">Recent administrative activity</p>
          <div className="mt-3 space-y-2">
            {recentActivity.map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                <div>
                  <span className="font-medium">{e.actorName}</span>
                  <span className="text-muted-foreground"> — {e.action.replace(/\./g, " ")} — {e.targetLabel}</span>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(e.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workspace links */}
      <div className="mt-6 flex flex-wrap gap-2">
        {canAccessEditorial(session.user?.role) && (
          <Link href="/editorial">
            <Button variant="outline">
              Editorial Desk <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
        {canAccessVerification(session.user?.role) && (
          <Link href="/verification">
            <Button variant="outline">
              Verification Queue <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
        {canAccessAdmin(session.user?.role) && (
          <Link href="/admin">
            <Button variant="outline">
              Admin Console <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
        <Link href="/portal">
          <Button variant="outline">View Portal</Button>
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        All data shown is demonstration content. Real operational dashboards require a connected backend with
        proper data aggregation, access control, and audit verification.
      </p>
    </div>
  );
}
