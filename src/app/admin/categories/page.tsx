"use client";

import { useEffect, useState } from "react";
import { contentApi } from "@/frontend/services";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Pencil, Plus, X } from "lucide-react";
import type { Category } from "@/types";

async function updateCategory(id: string, changes: Partial<Category>) {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sihu_token") ?? ""}`,
    },
    body: JSON.stringify(changes),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Unable to update the category");
  return data.category as Category;
}

async function createCategory(payload: { name: string; slug: string; description: string }) {
  const response = await fetch("/api/admin/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sihu_token") ?? ""}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Unable to create the category");
  return data.category as Category;
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [dialog, setDialog] = useState<{ type: string; catId: string } | null>(null);

  useEffect(() => {
    let active = true;
    contentApi
      .getCategories()
      .then((data) => {
        if (active) setCats(data);
      })
      .catch(() => {
        if (active) setCats([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggle = async (id: string) => {
    const current = cats.find((c) => c.id === id);
    if (!current) return;

    try {
      const updated = await updateCategory(id, { enabled: !current.enabled });
      setCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast("Category status toggled", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update the category", "error");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;

    try {
      const updated = await updateCategory(editing.id, {
        name: editing.name,
        slug: editing.slug,
        description: editing.description,
      });
      setCats((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      toast("Category updated", "success");
      setEditing(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update the category", "error");
    }
  };

  const addCategory = async () => {
    if (!newName.trim() || !newSlug.trim()) {
      toast("Name and slug are required", "error");
      return;
    }

    try {
      const created = await createCategory({
        name: newName.trim(),
        slug: newSlug.trim(),
        description: newDesc.trim(),
      });
      setCats((prev) => [...prev, created]);
      toast("Category added", "success");
      setNewName("");
      setNewDesc("");
      setNewSlug("");
      setAdding(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to create the category", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Category Management</h1>
          <p className="text-muted-foreground">Manage categories, slugs, descriptions, enable/disable.</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">New category</p>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="url-slug" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={addCategory}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      {editing && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="font-medium">Editing: {editing.name}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
            </div>
            <div className="mt-3">
              <Label>Description</Label>
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={saveEdit}>Save changes</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cats.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{c.description}</TableCell>
                  <TableCell><StatusBadge status={c.enabled ? "active" : "inactive"} /></TableCell>
                  <TableCell>{c.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing({ ...c })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDialog({ type: "toggle", catId: c.id })}>
                        {c.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!dialog}
        title="Change category status?"
        message="This will enable or disable the category. Disabled categories are hidden from the Portal."
        confirmLabel="Confirm"
        onConfirm={() => { if (dialog) void toggle(dialog.catId); setDialog(null); }}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
