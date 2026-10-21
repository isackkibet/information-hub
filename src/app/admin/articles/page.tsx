"use client";

import { useState, useMemo } from "react";
import { articles, categories } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Search, Eye, Pencil, Send } from "lucide-react";
import type { ArticleStatus } from "@/types";

const statuses: ArticleStatus[] = ["draft", "submitted", "in_review", "changes_requested", "approved", "rejected", "published", "archived"];

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialog, setDialog] = useState<{ type: string; articleId: string } | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (query && !a.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (catFilter && a.categoryId !== catFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      return true;
    });
  }, [query, catFilter, statusFilter]);

  const confirm = () => {
    if (!dialog) return;
    const a = articles.find((x) => x.id === dialog.articleId);
    if (dialog.type === "submit") {
      toast(`"${a?.title}" submitted for editorial review (demo)`, "success");
    } else if (dialog.type === "preview") {
      toast(`Previewing "${a?.title}" (demo)`, "info");
    } else if (dialog.type === "edit") {
      toast(`Opening editor for "${a?.title}" (demo)`, "info");
    }
    setDialog(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Article Management</h1>
          <p className="text-muted-foreground">
            Create, edit, submit, approve/reject with reasons. Publication is separate from submission.
          </p>
        </div>
        <Button onClick={() => toast("Create article form (demo)", "info")}>Create article</Button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="sm:w-48">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </Select>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {filtered.length} of {articles.length} articles
      </p>

      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="max-w-xs font-medium truncate">{a.title}</TableCell>
                  <TableCell className="text-muted-foreground">{a.categoryName}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{a.authorName || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.updatedAt ? formatDate(a.updatedAt) : formatDate(a.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setDialog({ type: "preview", articleId: a.id })} aria-label="Preview">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDialog({ type: "edit", articleId: a.id })}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDialog({ type: "submit", articleId: a.id })}>
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No articles match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!dialog}
        title={
          dialog?.type === "submit" ? "Submit for editorial review?" :
          dialog?.type === "edit" ? "Edit article?" : "Preview article?"
        }
        message={
          dialog?.type === "submit"
            ? "Submitting sends the article to the Editorial Desk for review. It will not be published automatically. This is a demo action."
            : dialog?.type === "edit"
            ? "Opening the article editor (demo). Changes will not be persisted without a backend."
            : "Previewing the article as it would appear publicly (demo)."
        }
        confirmLabel={dialog?.type === "submit" ? "Submit" : "Open"}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
