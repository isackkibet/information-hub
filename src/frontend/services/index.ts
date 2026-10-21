import { articles, categories, mediaItems, reports } from "@/data";

type Filters = { status?: string; categorySlug?: string; query?: string };

export const authProvider = {
  async signInWithGoogle() {
    return { ok: false, reason: "Google OAuth is not configured in this environment. Use the demo sign-in switcher for local preview." };
  },
  async signOut() {},
  async getSession() {
    return { authenticated: false };
  },
};

export const contentApi = {
  async getArticles(filters: Filters = {}) {
    let res = [...articles];
    if (filters.status) res = res.filter((a) => a.status === filters.status);
    if (filters.categorySlug) res = res.filter((a) => a.categorySlug === filters.categorySlug);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      res = res.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || (a.tags||[]).some(t=>t.includes(q)));
    }
    return res;
  },
  async getArticleBySlug(slug: string) {
    return articles.find((a) => a.slug === slug) || null;
  },
  async getCategories() {
    return categories.filter((c) => c.enabled);
  },
};

export const searchService = {
  async search(query: string) {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const res: Array<{ type: string; id: string; slug?: string; title: string; category?: string; excerpt: string }> = [];
    for (const a of articles) {
      if (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)) {
        res.push({ type: "article", id: a.id, slug: a.slug, title: a.title, category: a.categoryName, excerpt: a.summary });
      }
    }
    for (const m of mediaItems) {
      if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
        res.push({ type: "media", id: m.id, title: m.title, excerpt: m.description });
      }
    }
    for (const r of reports) {
      if (r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) {
        res.push({ type: "report", id: r.id, title: r.title, excerpt: r.description });
      }
    }
    return res.slice(0, 20);
  },
};

export const aiService = {
  async chat(messages: Array<{role:string,content:string}>, context?: {articleTitle?:string, articleHref?:string}) {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(typeof result?.error === "string" ? result.error : "The AI request failed. Please try again.");
    }
    if (typeof result?.reply !== "string") {
      throw new Error("The AI service returned an invalid response. Please try again.");
    }
    return {
      reply: result.reply as string,
      sources: Array.isArray(result.sources) ? result.sources as Array<{ label: string; href: string }> : [],
    };
  },
  async summarize(articleId: string) {
    const a = articles.find((x) => x.id === articleId);
    return { summary: a ? `Demo summary: ${a.summary}` : "Demo summary unavailable.", demo: true };
  },
};

export const workflowService = {
  async submitForReview() { return { ok: true }; },
  async approve() { return { ok: true }; },
  async reject() { return { ok: false, reason: "Demo - workflow not connected" }; },
  async requestChanges() { return { ok: true }; },
};

export const notificationService = {
  async list() { return []; },
  async markRead() {},
};

export const fileUploadService = {
  async upload() { return { ok: false, reason: "File uploads are not configured. Connect a storage backend to enable attachments." }; },
};
