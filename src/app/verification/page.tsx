"use client";

import { useState } from "react";
import { reports } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { FileSearch, MessageSquareText, CheckCheck } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function VerificationPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = reports.filter((r) =>
    ["submitted", "under_review", "needs_info"].includes(r.status)
  );

  const saveNote = (_id: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    toast("Verification note saved (demo — not persisted)", "success");
    setExpandedId(null);
  };

  const requestInfo = (id: string) => {
    toast("Additional information requested (demo)", "info");
    setExpandedId(id);
  };

  const markComplete = (_id: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    toast("Verification workflow marked complete (demo — requires backend to finalize)", "success");
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
                  <Button size="sm" variant="outline" onClick={() => toast("Evidence summary (demo)", "info")}>
                    <FileSearch className="h-3 w-3" />
                    Evidence
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => requestInfo(r.id)}>
                    <MessageSquareText className="h-3 w-3" />
                    Request info
                  </Button>
                  <Button size="sm" onClick={() => markComplete(r.id)}>
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
                    <Button size="sm" onClick={() => saveNote(r.id)}>Save note</Button>
                    <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {queue.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Verification queue empty (demo).
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
