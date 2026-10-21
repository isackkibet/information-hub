"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { FileSearch, MessageSquareText, CheckCheck } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { reportService } from "@/frontend/services";
import { getStoredToken } from "@/lib/auth";
import type { Report } from "@/types";

export default function VerificationPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    reportService.list().then((items) => {
      if (active) setReports(items);
    }).catch((error) => {
      if (active) toast(error instanceof Error ? error.message : "Unable to load reports", "error");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [toast]);

  const queue = reports.filter((r) =>
    ["submitted", "under_review", "needs_info"].includes(r.status)
  );

  const updateReport = async (id: string, status: Report["status"], message: string, note?: string) => {
    setBusyId(id);
    try {
      await reportService.setStatus(id, status, note);
      setReports((current) =>
        current.map((r) =>
          r.id === id ? { ...r, status, ...(note !== undefined ? { notes: note } : {}) } : r
        )
      );
      toast(message, "success");
      setExpandedId(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update the report", "error");
    } finally {
      setBusyId(null);
    }
  };

  const saveNote = (id: string) => {
    void updateReport(id, "under_review", "Verification note saved", notes[id]);
  };

  const requestInfo = (id: string) => {
    void updateReport(id, "needs_info", "Additional information requested");
  };

  const markComplete = (id: string) => {
    void updateReport(id, "verified", "Report verified");
  };

  const downloadAttachment = async (report: Report) => {
    if (!report.attachmentUrl) return;
    try {
      const token = getStoredToken();
      const response = await fetch(report.attachmentUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("Could not download this attachment");
      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${report.title.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60)}-evidence`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not download this attachment", "error");
    }
  };

  return (
    <AuthGuard type="verification">
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Verification Queue</h1>
      <p className="text-muted-foreground">
        Reports awaiting review. Private reporter identities and sensitive evidence are not shown here.
        Verification completion is only valid when the underlying system permits it.
      </p>

      <div className="mt-6 space-y-3">
        {queue.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.title}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.categoryName} • {r.location} • {formatDate(r.submittedAt)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={!r.attachmentUrl} onClick={() => void downloadAttachment(r)}>
                    <FileSearch className="h-3 w-3" />
                    {r.attachmentUrl ? "Download evidence" : "No attachment"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => requestInfo(r.id)}>
                    <MessageSquareText className="h-3 w-3" />
                    Request info
                  </Button>
                  <Button size="sm" disabled={busyId === r.id} onClick={() => markComplete(r.id)}>
                    <CheckCheck className="h-3 w-3" />
                    Complete
                  </Button>
                </div>
              </div>

              {expandedId === r.id && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                  <Label htmlFor={`note-${r.id}`}>Verification notes</Label>
                  <Textarea
                    id={`note-${r.id}`}
                    rows={3}
                    value={notes[r.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    placeholder="Add notes for this verification..."
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" disabled={busyId === r.id} onClick={() => saveNote(r.id)}>Save note</Button>
                    <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!loading && queue.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Verification queue is empty.
            </CardContent>
          </Card>
        )}
        {loading && <p className="text-sm text-muted-foreground">Loading reports…</p>}
      </div>
    </div>
    </AuthGuard>
  );
}
