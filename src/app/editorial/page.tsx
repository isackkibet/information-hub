"use client";

import { useState } from "react";
import { articles } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Eye, Check, X, MessageSquareText } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function EditorialPage() {
  const { toast } = useToast();
  const [dialog, setDialog] = useState<{ type: "approve" | "reject" | "changes"; articleId: string; title: string } | null>(null);
  const [reason, setReason] = useState("");

  const pending = articles.filter((a) =>
    ["submitted", "in_review", "changes_requested"].includes(a.status)
  );

  const confirm = () => {
    if (!dialog) return;
    if (dialog.type === "approve") {
      toast(`"${dialog.title}" approved (demo — not published automatically)`, "success");
    } else if (dialog.type === "reject") {
      toast(`"${dialog.title}" rejected (demo)`, "error");
    } else {
      toast(`Changes requested for "${dialog.title}" (demo)`, "info");
    }
    setDialog(null);
    setReason("");
  };

  return (
    <AuthGuard type="editorial">
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Editorial Desk</h1>
      <p className="text-muted-foreground">
        Review, request changes, approve or reject. Editorial approval and verification are separate states.
      </p>

      <div className="mt-6 space-y-3">
        {pending.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{a.title}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.categoryName} • {a.authorName || "Unknown"} • {formatDate(a.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast(`Reviewing "${a.title}" (demo)`, "info")}>
                    <Eye className="h-3 w-3" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDialog({ type: "changes", articleId: a.id, title: a.title })}>
                    <MessageSquareText className="h-3 w-3" />
                    Request changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDialog({ type: "reject", articleId: a.id, title: a.title })}>
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => setDialog({ type: "approve", articleId: a.id, title: a.title })}>
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              No articles pending editorial review (demo).
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!dialog}
        title={
          dialog?.type === "approve" ? "Approve article?" :
          dialog?.type === "reject" ? "Reject article?" : "Request changes?"
        }
        message={
          dialog?.type === "approve"
            ? "Approving sends the article forward. Publication is a separate step. Demo action."
            : dialog?.type === "reject"
            ? "Provide a reason for rejection. This is a demo action."
            : "Provide specific change requests for the author. This is a demo action."
        }
        confirmLabel={dialog?.type === "approve" ? "Approve" : dialog?.type === "reject" ? "Reject" : "Send"}
        onConfirm={confirm}
        onCancel={() => { setDialog(null); setReason(""); }}
      />

      {dialog && dialog.type !== "approve" && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 p-4" onClick={() => { setDialog(null); setReason(""); }}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{dialog.type === "reject" ? "Reason for rejection" : "Requested changes"}</h2>
            <div className="mt-3 space-y-2">
              <Label htmlFor="reason">Reason / details</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Explain what needs to change..." />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setDialog(null); setReason(""); }}>Cancel</Button>
              <Button size="sm" onClick={confirm}>{dialog.type === "reject" ? "Reject" : "Send request"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
