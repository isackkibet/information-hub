import { apiFetch } from "./api-client";
import type { Article, Category, MediaItem, Report, Task, User } from "@/types";

type Filters = { status?: string; categorySlug?: string; query?: string };

export const contentApi = {
  async getArticles(filters: Filters = {}): Promise<Article[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.query) params.set("q", filters.query);

    const query = params.toString();
    const data = await apiFetch<{ articles: Article[] }>(`/api/articles${query ? `?${query}` : ""}`);
    return data.articles;
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const data = await apiFetch<{ article: Article }>(`/api/articles/${encodeURIComponent(slug)}`);
      return data.article;
    } catch {
      return null;
    }
  },

  async createArticle(payload: {
    title: string;
    summary: string;
    content: string;
    categoryId: string;
    location?: string;
    sourceUrl?: string;
  }) {
    return apiFetch<{ article: { id: string; slug: string; status: string } }>("/api/articles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async setArticleStatus(id: string, status: string) {
    return apiFetch<{ article: { id: string; status: string } }>(`/api/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getCategories(): Promise<Category[]> {
    const data = await apiFetch<{ categories: Category[] }>("/api/categories");
    return data.categories;
  },

  async getMedia(): Promise<MediaItem[]> {
    const data = await apiFetch<{ items: MediaItem[] }>("/api/media");
    return data.items;
  },
};

export const aiService = {
  async chat(
    messages: Array<{ role: string; content: string }>,
    context?: { articleTitle?: string; articleHref?: string }
  ) {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        typeof result?.error === "string" ? result.error : "The AI request failed. Please try again."
      );
    }
    if (typeof result?.reply !== "string") {
      throw new Error("The AI service returned an invalid response. Please try again.");
    }
    return {
      reply: result.reply as string,
      sources: Array.isArray(result.sources)
        ? (result.sources as Array<{ label: string; href: string }>)
        : [],
    };
  },

  async summarize(articleSlug: string) {
    const article = await contentApi.getArticleBySlug(articleSlug);
    return {
      summary: article ? article.summary : "Summary unavailable.",
    };
  },
};

export const workflowService = {
  async submitForReview(articleId: string) {
    return contentApi.setArticleStatus(articleId, "submitted");
  },
  async approve(articleId: string) {
    return contentApi.setArticleStatus(articleId, "approved");
  },
  async reject(articleId: string) {
    return contentApi.setArticleStatus(articleId, "rejected");
  },
  async requestChanges(articleId: string) {
    return contentApi.setArticleStatus(articleId, "changes_requested");
  },
};

export const fileUploadService = {
  async upload(file: File): Promise<{ ok: boolean; id?: string; name?: string; reason?: string }> {
    const token = typeof window === "undefined" ? null : localStorage.getItem("sihu_token");
    if (!token) return { ok: false, reason: "Sign in before uploading an attachment." };

    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, reason: typeof data?.error === "string" ? data.error : "File upload failed." };
    return { ok: true, id: data.upload.id, name: data.upload.name };
  },
  async remove(id: string) {
    const token = typeof window === "undefined" ? null : localStorage.getItem("sihu_token");
    if (!token) return;
    await fetch(`/api/uploads/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export const reportService = {
  async list(): Promise<Report[]> {
    const data = await apiFetch<{ reports: Report[] }>("/api/reports");
    return data.reports;
  },
  async submit(payload: { title: string; description: string; categoryId: string; location?: string; attachmentId?: string }) {
    return apiFetch<{ report: { id: string; status: string } }>("/api/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async setStatus(id: string, status: string, notes?: string) {
    return apiFetch<{ report: { id: string; status: string } }>(`/api/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
    });
  },
};

export const taskService = {
  async list(): Promise<Task[]> {
    const data = await apiFetch<{ tasks: Task[] }>("/api/tasks");
    return data.tasks;
  },
  async updateStatus(id: string, status: string) {
    return apiFetch<{ task: { id: string; status: string } }>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const adminService = {
  async listUsers(): Promise<User[]> {
    const data = await apiFetch<{ users: User[] }>("/api/admin/users");
    return data.users;
  },
  async updateUser(id: string, changes: { role?: string; status?: string }) {
    return apiFetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  },
};

export const auditService = {
  async list() {
    const data = await apiFetch<{ events: unknown[] }>("/api/audit");
    return data.events;
  },
};
