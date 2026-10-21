import { auditEvents } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

const actionColors: Record<string, string> = {
  "user.role_changed": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "user.activated": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "user.deactivated": "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "article.created": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "article.edited": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "article.submitted": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "article.approved": "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "article.rejected": "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "article.changes_requested": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "category.created": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "category.updated": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "report.submitted": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "report.reviewed": "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
};

export default function AdminAuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit History</h1>
      <p className="text-muted-foreground">
        Demonstration events showing actor, action, affected item, and timestamp.
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This frontend-only audit log is not secure or tamper-proof. A real backend must independently enforce
          audit integrity, protect against modification, and persist logs securely.
        </p>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(e.timestamp)}</TableCell>
                  <TableCell className="font-medium">{e.actorName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        actionColors[e.action] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {e.action.replace(/\./g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{e.targetLabel}</p>
                      <p className="text-xs text-muted-foreground">{e.targetType}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">{e.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
