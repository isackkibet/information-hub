import Link from "next/link";
import { prisma } from "@/backend/database/prisma";
import { getArticles, getAuditEvents } from "@/backend/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight, FileText, Images, Users, ClipboardCheck, FileSearch,
  Folder, Activity, Plus,
} from "lucide-react";

export const instant = false;

export default async function AdminDashboard() {
  const [users, publishedArticles, drafts, pendingArticles, pendingReports, publishedMedia, recentArticles, auditEvents] = await Promise.all([
    prisma.user.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED"] } } }),
    prisma.report.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFO"] } } }),
    prisma.mediaItem.count({ where: { isPublished: true } }),
    getArticles({ status: "published", limit: 5 }),
    getAuditEvents(),
  ]);

  const metrics = [
    { label: "Published articles", value: publishedArticles, detail: `${drafts} saved as drafts`, href: "/admin/articles", icon: FileText, tone: "text-cyan-700 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-950/60" },
    { label: "Published media", value: publishedMedia, detail: "Videos, podcasts, and photos", href: "/admin/media", icon: Images, tone: "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-950/60" },
    { label: "Articles needing review", value: pendingArticles, detail: "Submitted or awaiting changes", href: "/editorial", icon: ClipboardCheck, tone: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60" },
    { label: "Reports to verify", value: pendingReports, detail: "Community submissions", href: "/verification", icon: FileSearch, tone: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60" },
  ];

  const shortcuts = [
    { href: "/admin/articles", label: "Create an article", detail: "Write a story, save it as a draft, then publish it.", icon: FileText },
    { href: "/admin/media", label: "Add media content", detail: "Upload a photo or add a video or podcast link.", icon: Images },
    { href: "/admin/users", label: "Manage users", detail: `${users} registered ${users === 1 ? "account" : "accounts"} on the platform.`, icon: Users },
    { href: "/admin/categories", label: "Manage categories", detail: "Organize articles and media by topic.", icon: Folder },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-card to-cyan-50/50 p-5 dark:to-cyan-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sango Information Hub</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage content, review community contributions, and keep the platform up to date.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/articles"><Button><Plus className="h-4 w-4" />New article</Button></Link>
          <Link href="/admin/media"><Button variant="outline"><Plus className="h-4 w-4" />Add media</Button></Link>
        </div>
      </header>

      <section aria-label="Platform overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md"><CardContent className="p-4">
              <div className="flex items-start justify-between gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span><ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div>
              <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p><p className="mt-1 font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </CardContent></Card>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-3"><h2 className="text-lg font-semibold">Quick actions</h2><p className="text-sm text-muted-foreground">Common tasks in one place.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href, label, detail, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Card className="h-full transition group-hover:border-primary/40 group-hover:shadow-sm"><CardContent className="flex items-start gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium group-hover:text-primary">{label}</span><span className="mt-1 block text-sm text-muted-foreground">{detail}</span></span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </CardContent></Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Recently published</h2><p className="mt-1 text-sm text-muted-foreground">Latest articles visible to visitors.</p></div><Link href="/admin/articles" className="text-sm font-medium text-primary hover:underline">All articles</Link></div>
            {recentArticles.length ? <ul className="mt-4 divide-y divide-border">{recentArticles.map((article) => <li key={article.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{article.title}</p><p className="mt-1 text-xs text-muted-foreground">{article.categoryName}</p></div><span className="shrink-0 text-xs text-muted-foreground">{article.publishedAt ? formatDate(article.publishedAt) : "Published"}</span></li>)}</ul> : <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">No published articles yet. Create one and publish it to show it in Media Content.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Recent activity</h2><p className="mt-1 text-sm text-muted-foreground">Latest changes made by the team.</p></div><Link href="/admin/audit" className="text-sm font-medium text-primary hover:underline">Audit log</Link></div>
            {auditEvents.length ? <ul className="mt-4 space-y-3">{auditEvents.slice(0, 5).map((event) => <li key={event.id} className="flex items-start gap-3 text-sm"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-primary"><Activity className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><span className="font-medium">{event.actorName}</span><span className="text-muted-foreground"> · {event.action.replace(/[._]/g, " ")} · </span><span>{event.targetLabel}</span></span><span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.timestamp)}</span></li>)}</ul> : <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">No administrative activity has been recorded yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5"><CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">How publishing works</p><p className="text-sm text-muted-foreground">New articles start as drafts. Publish them from Articles to make them visible under Media Content.</p></div><Link href="/portal/media?type=articles" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">View public articles <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>
    </div>
  );
}
