"use client";

import { useEffect, useState } from "react";
import { contentApi, workflowService } from "@/frontend/services";
import type { Article } from "@/types";
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    contentApi
      .getArticles({ status: "submitted" })
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch(() => {
        if (active) setArticles([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const pending = articles.filter((a) =>
    ["submitted", "in_review", "changes_requested"].includes(a.status)
  );

  const confirm = async () => {
    if (!dialog) return;

    setBusy(true);
    try {
      if (dialog.type === "approve") {
        await workflowService.approve(dialog.articleId);
      } else if (dialog.type === "reject") {
        await workflowService.reject(dialog.articleId);
      } else {
        await workflowService.requestChanges(dialog.articleId);
      }
      setArticles((current) => current.filter((a) => a.id !== dialog.articleId));
      toast(
        dialog.type === "approve"
          ? `"${dialog.title}" approved`
          : dialog.type === "reject"
            ? `"${dialog.title}" rejected`
            : `Changes requested for "${dialog.title}"`,
        dialog.type === "reject" ? "error" : "success"
      );
      setDialog(null);
      setReason("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update the article", "error");
    } finally {
      setBusy(false);
    }
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
                  <Button size="sm" variant="outline" onClick={() => toast(`Opening "${a.title}"`, "info")}>
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
              No articles pending editorial review.
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
            ? "Approving sends the article forward. Publication is a separate step."
            : dialog?.type === "reject"
            ? "Provide a reason for rejection."
            : "Provide specific change requests for the author."
        }
        confirmLabel={dialog?.type === "approve" ? "Approve" : dialog?.type === "reject" ? "Reject" : "Send"}
        onConfirm={() => void confirm()}
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
              <Button size="sm" disabled={busy} onClick={() => void confirm()}>{dialog.type === "reject" ? "Reject" : "Send request"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
