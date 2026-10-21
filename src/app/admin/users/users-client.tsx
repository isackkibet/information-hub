"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RoleBadge, StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { getStoredToken } from "@/lib/auth";
import { useSession } from "@/hooks/use-session";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Users, X } from "lucide-react";
import type { Role, User } from "@/types";

type ManagedUser = User & { status: "active" | "suspended" };
type UserUpdate = Partial<Pick<ManagedUser, "role" | "status">>;
type CreateUser = { name: string; email: string; password: string; role: Exclude<Role, "Visitor"> };

const roles: CreateUser["role"][] = ["Registered User", "Contributor", "Editor", "Verifier", "Administrator", "Leadership"];
const emptyForm: CreateUser = { name: "", email: "", password: "", role: "Registered User" };

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  if (!token) throw new Error("Your session ended. Sign in again to manage users.");

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "The user request failed.");
  return data as T;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { session } = useSession();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateUser>(emptyForm);
  const currentUserId = session.user?.id ?? null;

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const data = await adminRequest<{ users: ManagedUser[] }>("/api/admin/users");
        if (active) setUsers(data.users);
      } catch (error) {
        if (active) toast(error instanceof Error ? error.message : "Unable to load users", "error");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUsers();
    return () => { active = false; };
  }, [toast]);

  const filtered = useMemo(() => users.filter((user) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery && !user.name.toLowerCase().includes(normalizedQuery) && !user.email.toLowerCase().includes(normalizedQuery)) return false;
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  }), [users, query, roleFilter, statusFilter]);

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await adminRequest<{ user: ManagedUser }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setUsers((current) => [data.user, ...current]);
      setForm(emptyForm);
      setShowCreateForm(false);
      toast(`Account created for ${data.user.name}`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to create the account", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (userId: string, update: UserUpdate) => {
    setUpdatingUserId(userId);
    try {
      const data = await adminRequest<{ user: Partial<ManagedUser> & Pick<ManagedUser, "id"> }>(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(update),
      });
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, ...data.user } : user));
      toast("User account updated", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update this account", "error");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">Create accounts, assign roles, and manage access.</p>
        </div>
        <Button onClick={() => setShowCreateForm((open) => !open)}>
          {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreateForm ? "Close" : "Add user"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mt-5">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold">Create a member account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Set an initial password and role. Share the login details with the member securely.</p>
            <form onSubmit={createUser} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Full name
                <Input autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Email address
                <Input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Initial password
                <Input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Account role
                <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as CreateUser["role"] })}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </Select>
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  <Users className="h-4 w-4" />
                  {saving ? "Creating account…" : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="pl-9" aria-label="Search users" />
        </div>
        <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="sm:w-48" aria-label="Filter by role">
          <option value="">All roles</option>
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="sm:w-40" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {loading ? "Loading users…" : `${filtered.length} of ${users.length} users`}
      </p>

      <Card className="mt-3 overflow-hidden">
        <CardContent className="overflow-x-auto p-0">
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
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-nowrap font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex min-w-48 items-center gap-2">
                      <RoleBadge role={user.role} />
                      <Select
                        aria-label={`Assign role to ${user.name}`}
                        value={user.role}
                        disabled={updatingUserId === user.id || currentUserId === user.id}
                        onChange={(event) => void updateUser(user.id, { role: event.target.value as Role })}
                        className="h-8 text-xs"
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(user.registeredAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingUserId === user.id || currentUserId === user.id}
                      onClick={() => void updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })}
                    >
                      {updatingUserId === user.id ? "Saving…" : user.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {users.length === 0 ? "No user accounts are available." : "No users match your filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
