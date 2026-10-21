export interface AuthProvider {
  signInWithGoogle(): Promise<{ ok: boolean; reason?: string }>;
  signOut(): Promise<void>;
  getSession(): Promise<{ authenticated: boolean; user?: unknown }>;
}

export interface ContentApi {
  getArticles(filters?: Record<string, unknown>): Promise<unknown[]>;
  getArticleBySlug(slug: string): Promise<unknown | null>;
  getCategories(): Promise<unknown[]>;
}

export interface SearchService {
  search(query: string, scope?: string): Promise<unknown[]>;
}

export interface AiService {
  chat(messages: Array<{role:string,content:string}>, context?: Record<string, unknown>): Promise<{ reply: string; sources?: Array<{label:string,href:string}>; demo: boolean }>;
  summarize(articleId: string): Promise<{ summary: string; demo: boolean }>;
}

export interface WorkflowService {
  submitForReview(articleId: string): Promise<{ ok: boolean }>;
  approve(articleId: string, reason?: string): Promise<{ ok: boolean }>;
  reject(articleId: string, reason: string): Promise<{ ok: boolean }>;
  requestChanges(articleId: string, reason: string): Promise<{ ok: boolean }>;
}

export interface NotificationService {
  list(): Promise<unknown[]>;
  markRead(id: string): Promise<void>;
}

export interface FileUploadService {
  upload(file: File): Promise<{ ok: boolean; url?: string; reason?: string }>;
}
