"use client";

import { useState } from "react";
import Link from "next/link";
import { reports } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { ChevronDown, ChevronUp, FileText, MapPin } from "lucide-react";
import type { Report } from "@/types";

// Demo timeline for each report status
function getStatusTimeline(status: string, submittedAt: string) {
  const steps = [
    { label: "Submitted", date: submittedAt, done: true },
    { label: "Under review", date: status === "under_review" || status === "needs_info" || status === "verified" || status === "closed" ? submittedAt : null, done: ["under_review", "needs_info", "verified", "closed"].includes(status) },
    { label: "Additional info requested", date: status === "needs_info" ? submittedAt : null, done: status === "needs_info" },
    { label: "Verified", date: status === "verified" || status === "closed" ? submittedAt : null, done: status === "verified" || status === "closed" },
    { label: "Closed", date: status === "closed" ? submittedAt : null, done: status === "closed" },
  ];
  return steps;
}

export default function SubmissionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
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
        <p className="text-muted-foreground">Please sign in to view your submissions.</p>
        <Link href="/sign-in?redirect=%2Faccount%2Fsubmissions">
          <Button className="mt-3">Go to Sign in</Button>
        </Link>
      </div>
    );
  }

  // Filter reports to show only those submitted by the demo user (or all for demo)
  const myReports: Report[] = reports;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">My Submissions</h1>
      <p className="text-muted-foreground">Your submitted reports, status timeline and any requests for changes.</p>

      {myReports.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You have not submitted any reports yet.</p>
            <Link href="/submit"><Button size="sm">Submit a report</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {myReports.map((r) => {
            const isOpen = expanded === r.id;
            const timeline = getStatusTimeline(r.status, r.submittedAt);
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <button
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.title}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{r.description}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {r.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {r.location}
                          </span>
                        )}
                        <span>Submitted {formatDate(r.submittedAt)}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-medium">Status timeline</p>
                      <div className="mt-3 space-y-2">
                        {timeline.map((step, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step.done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                              {step.done ? "✓" : "○"}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${step.done ? "" : "text-muted-foreground"}`}>{step.label}</p>
                              {step.date && <p className="text-xs text-muted-foreground">{formatDate(step.date)}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {r.notes && (
                        <div className="mt-4 rounded-lg bg-muted/40 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Reviewer notes</p>
                          <p className="mt-1 text-sm">{r.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Link href="/submit">
                          <Button size="sm" variant="outline">Submit new report</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
