import { users, articles, reports, auditEvents } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
export default function AdminDashboard() {
  const published = articles.filter((a) => a.status === "published").length;
  const pending = articles.filter((a) => ["submitted","in_review","changes_requested"].includes(a.status)).length;
  const verif = reports.filter((r) => ["submitted","under_review","needs_info"].includes(r.status)).length;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of demo data. All statistics are mock data.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Registered users</p><p className="text-2xl font-semibold">{users.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Published articles</p><p className="text-2xl font-semibold">{published}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending editorial review</p><p className="text-2xl font-semibold">{pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending verification</p><p className="text-2xl font-semibold">{verif}</p></CardContent></Card>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4">
          <p className="font-medium">Recent administrative activity (demo)</p>
          <div className="mt-3 space-y-2">
            {auditEvents.slice(0,4).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div><span className="font-medium">{e.actorName}</span> • {e.action.replace("."," ")} • {e.targetLabel}</div>
                <span className="text-muted-foreground">{formatDate(e.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
