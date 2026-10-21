"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/frontend/services/api-client";
import { contentApi, fileUploadService } from "@/frontend/services";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Category, MediaItem } from "@/types";

type AdminMedia = MediaItem & { categoryId?: string; category?: { name: string } | null };
type MediaDraft = { type: string; title: string; description: string; image: string; mediaUrl: string; duration: string; categoryId: string; publishedAt: string; isPublished: boolean };
const emptyDraft: MediaDraft = { type: "VIDEO", title: "", description: "", image: "", mediaUrl: "", duration: "", categoryId: "", publishedAt: "", isPublished: false };
const labels: Record<string, string> = { RADIO: "Podcast / Radio", PODCAST: "Podcast", VIDEO: "Video", NEWSPAPER: "Article / Newspaper", IMAGE: "Image / Photo" };

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<MediaDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [mediaData, categoryData] = await Promise.all([
      apiFetch<{ items: AdminMedia[] }>("/api/admin/media"),
      contentApi.getCategories(),
    ]);
    setItems(mediaData.items);
    setCategories(categoryData);
  };

  useEffect(() => {
    void Promise.all([apiFetch<{ items: AdminMedia[] }>("/api/admin/media"), contentApi.getCategories()])
      .then(([mediaData, categoryData]) => { setItems(mediaData.items); setCategories(categoryData); })
      .catch((error) => toast(error instanceof Error ? error.message : "Unable to load media.", "error"));
  }, [toast]);

  const setField = <K extends keyof MediaDraft>(key: K, value: MediaDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const edit = (item: AdminMedia) => {
    setEditingId(item.id);
    setDraft({ type: item.type.toUpperCase(), title: item.title, description: item.description, image: item.image ?? "", mediaUrl: item.mediaUrl ?? "", duration: item.duration ?? "", categoryId: item.categoryId ?? "", publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : "", isPublished: item.isPublished });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => { setEditingId(null); setDraft(emptyDraft); };

  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    const result = await fileUploadService.upload(file);
    if (!result.ok || !result.id) { toast(result.reason ?? "Photo upload failed.", "error"); return; }
    setField("image", `/api/uploads/${result.id}`);
    toast("Photo uploaded.", "success");
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const endpoint = editingId ? `/api/admin/media/${editingId}` : "/api/admin/media";
      await apiFetch(endpoint, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(draft) });
      toast(editingId ? "Media content updated." : "Media content created.", "success");
      reset();
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to save media content.", "error");
    } finally { setBusy(false); }
  };

  const remove = async (item: AdminMedia) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try {
      await apiFetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast("Media content deleted.", "success");
    } catch (error) { toast(error instanceof Error ? error.message : "Unable to delete this item.", "error"); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Media Content</h1><p className="text-muted-foreground">Manage photos, videos, podcasts, and other published media.</p></div>
      <Card><CardContent className="p-5">
        <h2 className="font-semibold">{editingId ? "Edit content" : "Add content"}</h2>
        <form onSubmit={save} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">Content type<Select value={draft.type} onChange={(e) => setField("type", e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
          <label className="space-y-1 text-sm">Title<Input required minLength={3} maxLength={200} value={draft.title} onChange={(e) => setField("title", e.target.value)} /></label>
          <label className="space-y-1 text-sm">Topic category<Select value={draft.categoryId} onChange={(e) => setField("categoryId", e.target.value)}><option value="">No topic</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
          <label className="space-y-1 text-sm">Publication date<Input type="datetime-local" value={draft.publishedAt} onChange={(e) => setField("publishedAt", e.target.value)} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Description<Textarea rows={3} maxLength={5000} value={draft.description} onChange={(e) => setField("description", e.target.value)} /></label>
          <label className="space-y-1 text-sm">Thumbnail image URL<Input type="url" placeholder="https://…" value={draft.image.startsWith("/api/uploads/") ? "" : draft.image} onChange={(e) => setField("image", e.target.value)} /></label>
          <label className="space-y-1 text-sm">Or upload a photo<input className="block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadPhoto(e.target.files?.[0]).catch((error) => toast(error instanceof Error ? error.message : "Photo upload failed.", "error"))} /><span className="text-xs text-muted-foreground">JPG, PNG, or WebP, up to 8 MB.</span></label>
          <label className="space-y-1 text-sm md:col-span-2">Media or embed URL<Input type="url" placeholder="Video, audio, or podcast embed URL" value={draft.mediaUrl} onChange={(e) => setField("mediaUrl", e.target.value)} /><span className="text-xs text-muted-foreground">Use a direct MP4/MP3 link or an embed URL from your media provider.</span></label>
          <label className="space-y-1 text-sm">Duration (optional)<Input placeholder="e.g. 12:40" value={draft.duration} onChange={(e) => setField("duration", e.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isPublished} onChange={(e) => setField("isPublished", e.target.checked)} />Published and visible to visitors</label>
          <div className="flex gap-2 md:col-span-2"><Button disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Add content"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
        </form>
      </CardContent></Card>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Content library ({items.length})</h2>
        {items.map((item) => <Card key={item.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{labels[item.type.toUpperCase()] ?? item.type} · {item.isPublished ? "Published" : "Draft"}{item.category?.name ? ` · ${item.category.name}` : ""}</p></div><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => edit(item)}>Edit</Button><Button type="button" variant="outline" size="sm" onClick={() => void remove(item)}>Delete</Button></div></CardContent></Card>)}
        {items.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No media content has been added yet.</p>}
      </section>
    </div>
  );
}
