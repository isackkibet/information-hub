"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/frontend/services/api-client";
import { contentApi, fileUploadService } from "@/frontend/services";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Article, Category } from "@/types";

type ArticleDraft = { title: string; summary: string; content: string; categoryId: string; image: string; imageAlt: string };
const emptyDraft: ArticleDraft = { title: "", summary: "", content: "", categoryId: "", image: "", imageAlt: "" };

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<ArticleDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const load = async () => {
    const [articleRows, categoryRows] = await Promise.all([contentApi.getArticles(), contentApi.getCategories()]);
    setArticles(articleRows);
    setCategories(categoryRows);
  };
  useEffect(() => {
    void Promise.all([contentApi.getArticles(), contentApi.getCategories()])
      .then(([articleRows, categoryRows]) => { setArticles(articleRows); setCategories(categoryRows); })
      .catch((error) => toast(error instanceof Error ? error.message : "Unable to load articles.", "error"));
  }, [toast]);
  const setField = <K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const edit = (article: Article) => {
    setEditingId(article.id);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setDraft({ title: article.title, summary: article.summary, content: article.content, categoryId: article.categoryId, image: article.image ?? "", imageAlt: article.imageAlt ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setEditingId(null);
    setDraft(emptyDraft);
  };
  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    const result = await fileUploadService.upload(file);
    if (!result.ok || !result.id) {
      toast(result.reason ?? "Photo upload failed.", "error");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setField("image", `/api/uploads/${result.id}`);
    toast("Photo uploaded. Save the article to attach it.", "success");
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    try {
      if (editingId) await apiFetch(`/api/articles/${editingId}`, { method: "PATCH", body: JSON.stringify(draft) });
      else await contentApi.createArticle(draft);
      toast(editingId ? "Article updated." : "Article created as a draft.", "success"); reset(); await load();
    } catch (error) { toast(error instanceof Error ? error.message : "Unable to save article.", "error"); }
    finally { setBusy(false); }
  };
  const publish = async (article: Article) => {
    const status = article.status === "published" ? "draft" : "published";
    try { await contentApi.setArticleStatus(article.id, status); await load(); toast(status === "published" ? "Article published." : "Article unpublished.", "success"); }
    catch (error) { toast(error instanceof Error ? error.message : "Unable to change publication status.", "error"); }
  };
  const remove = async (article: Article) => {
    if (!window.confirm(`Delete “${article.title}”?`)) return;
    try { await apiFetch(`/api/articles/${article.id}`, { method: "DELETE" }); setArticles((rows) => rows.filter((row) => row.id !== article.id)); toast("Article deleted.", "success"); }
    catch (error) { toast(error instanceof Error ? error.message : "Unable to delete article.", "error"); }
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">Article Management</h1><p className="text-muted-foreground">Create, edit, publish, unpublish, and delete articles.</p></div>
    <Card><CardContent className="p-5"><h2 className="font-semibold">{editingId ? "Edit article" : "Create article"}</h2>
      <form onSubmit={save} className="mt-4 grid gap-4">
        <label className="space-y-1 text-sm">Title<Input required minLength={5} maxLength={200} value={draft.title} onChange={(e) => setField("title", e.target.value)} /></label>
        <label className="space-y-1 text-sm">Topic category<Select required value={draft.categoryId} onChange={(e) => setField("categoryId", e.target.value)}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
        <label className="space-y-1 text-sm">Summary<Input required minLength={10} value={draft.summary} onChange={(e) => setField("summary", e.target.value)} /></label>
        <label className="space-y-1 text-sm">Article body<Textarea required rows={8} value={draft.content} onChange={(e) => setField("content", e.target.value)} /></label>
        <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Upload article photo<input className="block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadPhoto(e.target.files?.[0]).catch((error) => toast(error instanceof Error ? error.message : "Photo upload failed.", "error"))} /><span className="block text-xs text-muted-foreground">JPG, PNG, or WebP, up to 8 MB.</span></label>
          <label className="space-y-1 text-sm">Or use an image URL<Input type="url" placeholder="https://…" value={draft.image.startsWith("/api/uploads/") ? "" : draft.image} onChange={(e) => { if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoPreview(null); setField("image", e.target.value); }} /></label>
          <label className="space-y-1 text-sm sm:col-span-2">Photo description for accessibility<Input placeholder="Describe what the photo shows" value={draft.imageAlt} onChange={(e) => setField("imageAlt", e.target.value)} /></label>
          {(photoPreview || (draft.image && !draft.image.startsWith("/api/uploads/"))) && <div className="relative aspect-[16/7] overflow-hidden rounded-lg border border-border sm:col-span-2"><Image src={photoPreview ?? draft.image} alt={draft.imageAlt || "Article photo preview"} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 800px" /><span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-medium text-white">Article photo preview</span></div>}
        </div>
        <div className="flex gap-2"><Button disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Create draft"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
      </form>
    </CardContent></Card>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Articles ({articles.length})</h2>
      {articles.map((article) => <Card key={article.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-medium">{article.title}</p><p className="text-sm capitalize text-muted-foreground">{article.categoryName} · {article.status.replaceAll("_", " ")}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => edit(article)}>Edit</Button><Button variant="outline" size="sm" onClick={() => void publish(article)}>{article.status === "published" ? "Unpublish" : "Publish"}</Button><Button variant="outline" size="sm" onClick={() => void remove(article)}>Delete</Button></div></CardContent></Card>)}
      {articles.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No articles yet.</p>}
    </section>
  </div>;
}
