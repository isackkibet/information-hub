import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  // Article statuses
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_review: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  changes_requested: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // Report statuses
  under_review: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  needs_info: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // Task statuses
  assigned: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  // Account statuses
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  inactive: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  suspended: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.replace(/[-\s]/g, "_").toLowerCase();
  const colorClass = statusColors[normalized] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colorClass,
        className
      )}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const roleColors: Record<string, string> = {
    Administrator: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    Editor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    Verifier: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    Contributor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    Leadership: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    "Registered User": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Visitor: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        roleColors[role] || roleColors["Registered User"],
        className
      )}
    >
      {role}
    </span>
  );
}
