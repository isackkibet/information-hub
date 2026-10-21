"use client";

import { useState } from "react";
import Link from "next/link";
import { tasks } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { getNavForRole } from "@/lib/permissions";
import { Calendar, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function TasksPage() {
  const { toast } = useToast();
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
        <p className="text-muted-foreground">Please sign in to view your tasks.</p>
        <Link href="/sign-in?redirect=%2Faccount%2Ftasks">
          <Button className="mt-3">Go to Sign in</Button>
        </Link>
      </div>
    );
  }

  const nav = getNavForRole(session.user?.role);
  // Show tasks relevant to the user's role
  const myTasks = tasks.filter((t) => {
    if (!session.user) return false;
    // Admin sees all, others see tasks matching their role or assigned to them
    if (session.user.role === "Administrator") return true;
    return t.assigneeId === session.user.id || t.roleRequired === session.user.role;
  });

  const _statusIcon: Record<string, React.ReactNode> = {
    assigned: <Clock className="h-4 w-4 text-blue-600" />,
    in_progress: <Clock className="h-4 w-4 text-indigo-600" />,
    done: <CheckCircle className="h-4 w-4 text-emerald-600" />,
    blocked: <AlertCircle className="h-4 w-4 text-rose-600" />,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">My Tasks</h1>
      <p className="text-muted-foreground">
        Assigned tasks based on your role ({session.user?.role}). Available actions depend on permissions.
      </p>

      {myTasks.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No tasks assigned to you at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {myTasks.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t.title}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {t.assigneeName}
                      </span>
                      {t.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(t.dueDate)}
                        </span>
                      )}
                      {t.roleRequired && <span>Requires: {t.roleRequired}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.status === "assigned" && (
                      <Button
                        size="sm"
                        onClick={() => toast("Task started", "success")}
                      >
                        Start task
                      </Button>
                    )}
                    {t.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={() => toast("Task marked complete", "success")}
                      >
                        Mark complete
                      </Button>
                    )}
                    {t.status === "blocked" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast("Requesting unblock", "info")}
                      >
                        Request unblock
                      </Button>
                    )}
                    {nav.showEditorial && t.title.includes("Review") && (
                      <Link href="/editorial">
                        <Button size="sm" variant="outline">Open Editorial Desk</Button>
                      </Link>
                    )}
                    {nav.showVerification && t.title.includes("Verify") && (
                      <Link href="/verification">
                        <Button size="sm" variant="outline">Open Verification Queue</Button>
                      </Link>
                    )}
                    {nav.showAdmin && t.title.includes("category") && (
                      <Link href="/admin/categories">
                        <Button size="sm" variant="outline">Manage categories</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
