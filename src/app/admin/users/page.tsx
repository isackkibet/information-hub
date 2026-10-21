"use client";

import { useState, useMemo } from "react";
import { users } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RoleBadge, StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import type { Role, AccountStatus } from "@/types";

const roles: Role[] = ["Visitor", "Registered User", "Contributor", "Editor", "Verifier", "Administrator", "Leadership"];
const statuses: AccountStatus[] = ["active", "inactive", "suspended"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialog, setDialog] = useState<{ type: string; userId: string } | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (query && !u.name.toLowerCase().includes(query.toLowerCase()) && !u.email.toLowerCase().includes(query.toLowerCase())) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      return true;
    });
  }, [query, roleFilter, statusFilter]);

  const confirm = () => {
    if (!dialog) return;
    const u = users.find((x) => x.id === dialog.userId);
    if (dialog.type === "toggle") {
      toast(`${u?.name} status toggled (demo — not persisted)`, "success");
    } else if (dialog.type === "role") {
      toast(`Role assignment dialog for ${u?.name} (demo)`, "info");
    }
    setDialog(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            Search, filter, assign roles. Only administrators can assign roles.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-44">
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {filtered.length} of {users.length} users
      </p>

      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.registeredAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast(`Viewing ${u.name} (demo)`, "info")}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDialog({ type: "toggle", userId: u.id })}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setDialog({ type: "role", userId: u.id })}
                      >
                        Assign role
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No users match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!dialog}
        title={dialog?.type === "toggle" ? "Change user status?" : "Assign role?"}
        message={
          dialog?.type === "toggle"
            ? "This will change the user's account status. This is a demo action and will not be persisted."
            : "This will open a role assignment dialog. Only administrators can assign roles. This is a demo action."
        }
        confirmLabel={dialog?.type === "toggle" ? "Confirm" : "Proceed"}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
