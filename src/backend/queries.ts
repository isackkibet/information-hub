import "server-only";
import { prisma } from "@/backend/database/prisma";
import { toArticleStatus, toCategory, toReportStatus } from "@/backend/mappers";
import type { Article, AuditEvent, Category, MediaItem, Report, Task, User } from "@/types";

const articleInclude = {
  category: true,
  author: { select: { id: true, name: true } },
} as const;

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  image: string | null;
  imageAlt: string | null;
  location: string | null;
  sourceUrl: string | null;
  tags: string[];
  categoryId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  category: { slug: string; name: string };
  author: { id: string; name: string } | null;
};

export function mapArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    status: toArticleStatus(row.status),
    image: row.image ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    location: row.location ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    tags: row.tags,
    categoryId: row.categoryId,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    authorId: row.authorId ?? undefined,
    authorName: row.author?.name,
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getArticles(options: {
  status?: string;
  categorySlug?: string;
  query?: string;
  limit?: number;
} = {}): Promise<Article[]> {
  const { status, categorySlug, query, limit = 50 } = options;

  const rows = await prisma.article.findMany({
    where: {
      ...(status ? { status: status.toUpperCase() as never } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
    take: Math.min(limit, 100),
  });

  return rows.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({
    where: { slug },
    include: articleInclude,
  });
  return row ? mapArticle(row) : null;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });
  return row ? mapArticle(row) : null;
}

export type AssistantArticleSource = {
  title: string;
  slug: string;
  summary: string;
  content: string;
};

export async function searchAssistantArticles(query: string): Promise<AssistantArticleSource[]> {
  const stopWords = new Set([
    "about", "after", "also", "and", "are", "article", "articles", "can", "could", "did", "does", "find", "for", "from",
    "give", "have", "help", "into", "is", "its", "know", "like", "me", "mention", "more", "please", "published", "show",
    "that", "the", "their", "them", "there", "this", "tell", "than", "then", "these", "they", "what",
    "when", "where", "which", "who", "why", "with", "would", "you", "your", "sihu", "story", "stories",
    "summarise", "summarize", "source", "sources", "title", "answer", "question",
  ]);
  const terms = [...new Set(query.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])]
    .filter((term) => !stopWords.has(term))
    .slice(0, 8);
  if (!terms.length) return [];

  const rows = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: terms.flatMap((term) => [
        { title: { contains: term, mode: "insensitive" as const } },
        { summary: { contains: term, mode: "insensitive" as const } },
        { content: { contains: term, mode: "insensitive" as const } },
        { tags: { has: term } },
      ]),
    },
    select: {
      slug: true,
      title: true,
      summary: true,
      content: true,
      tags: true,
      publishedAt: true,
    },
    take: 100,
  });

  return rows
    .map((row) => {
      const title = row.title.toLowerCase();
      const summary = row.summary.toLowerCase();
      const content = row.content.toLowerCase();
      const tags = row.tags.join(" ").toLowerCase();
      const matchingTerms = terms.filter((term) =>
        title.includes(term) || summary.includes(term) || content.includes(term) || tags.includes(term)
      ).length;
      const score = terms.reduce(
        (total, term) => total + (title.includes(term) ? 5 : 0) + (tags.includes(term) ? 3 : 0)
          + (summary.includes(term) ? 2 : 0) + (content.includes(term) ? 1 : 0),
        0
      );
      return { row, score, matchingTerms };
    })
    .filter(({ score, matchingTerms }) => score > 0 && matchingTerms >= Math.min(2, terms.length))
    .sort((a, b) => b.score - a.score || (b.row.publishedAt?.getTime() ?? 0) - (a.row.publishedAt?.getTime() ?? 0))
    .slice(0, 4)
    .map(({ row }) => ({
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      content: row.content.slice(0, 1_800),
    }));
}

export async function getCategories(onlyEnabled = false): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: onlyEnabled ? { enabled: true } : undefined,
    orderBy: { order: "asc" },
  });
  return rows.map(toCategory);
}

type ReportRow = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  hasAttachment: boolean;
  attachmentUrl: string | null;
  notes: string | null;
  submittedAt: Date;
  categoryId: string;
  submittedById: string | null;
  category: { name: string };
  submittedBy: { id: string; name: string } | null;
};

export function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location ?? undefined,
    status: toReportStatus(row.status),
    hasAttachment: row.hasAttachment,
    attachmentUrl: row.attachmentUrl ?? undefined,
    notes: row.notes ?? undefined,
    submittedAt: row.submittedAt.toISOString(),
    categoryId: row.categoryId,
    categoryName: row.category.name,
    submittedById: row.submittedById ?? undefined,
    submittedByName: row.submittedBy?.name,
  };
}

export async function getReports(
  options: { submittedById?: string; status?: string; limit?: number } = {}
): Promise<Report[]> {
  const { submittedById, status, limit } = options;

  const rows = await prisma.report.findMany({
    where: {
      ...(submittedById ? { submittedById } : {}),
      ...(status ? { status: status.toUpperCase() as never } : {}),
    },
    include: {
      category: { select: { name: true } },
      submittedBy: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "desc" },
    ...(limit ? { take: Math.min(Math.max(1, limit), 100) } : {}),
  });
  return rows.map(mapReport);
}

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  assigneeId: string;
  roleRequired: string | null;
  assignee: { id: string; name: string };
};

const taskStatusMap: Record<string, Task["status"]> = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  BLOCKED: "blocked",
};

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: taskStatusMap[row.status] ?? "assigned",
    dueDate: row.dueDate?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    assigneeId: row.assigneeId,
    assigneeName: row.assignee.name,
    roleRequired: (row.roleRequired as Task["roleRequired"]) ?? undefined,
  };
}

export async function getTasks(
  options: { assigneeId?: string; roleRequired?: string; includeAll?: boolean } = {}
): Promise<Task[]> {
  const { assigneeId, roleRequired, includeAll } = options;

  const rows = await prisma.task.findMany({
    where: includeAll
      ? undefined
      : {
          OR: [
            ...(assigneeId ? [{ assigneeId }] : []),
            ...(roleRequired ? [{ roleRequired: roleRequired as never }] : []),
          ],
        },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapTask);
}

export async function getMediaItems(limit?: number): Promise<MediaItem[]> {
  const rows = await prisma.mediaItem.findMany({
    where: { isPublished: true },
    include: { category: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: Math.min(Math.max(1, limit), 100) } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type.toLowerCase() as MediaItem["type"],
    title: row.title,
    description: row.description,
    image: row.image ?? undefined,
    mediaUrl: row.mediaUrl ?? undefined,
    duration: row.duration ?? undefined,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    category: row.category?.name,
    categoryId: row.categoryId ?? undefined,
    isPublished: row.isPublished,
  }));
}

export async function getMediaItemById(id: string): Promise<MediaItem | null> {
  const items = await getMediaItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function getNotifications(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const { toRole, toUserStatus } = await import("@/lib/roles");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: toRole(row.role),
    status: toUserStatus(row.status),
    registeredAt: row.createdAt.toISOString(),
    avatar: row.image ?? undefined,
    lastActive: row.lastActiveAt?.toISOString(),
  }));
}

export async function getAuditEvents(): Promise<AuditEvent[]> {  const rows = await prisma.auditEvent.findMany({
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });

  const actionMap: Record<string, AuditEvent["action"]> = {
    USER_ROLE_CHANGED: "user.role_changed",
    USER_ACTIVATED: "user.activated",
    USER_DEACTIVATED: "user.deactivated",
    ARTICLE_CREATED: "article.created",
    ARTICLE_EDITED: "article.edited",
    ARTICLE_SUBMITTED: "article.submitted",
    ARTICLE_APPROVED: "article.approved",
    ARTICLE_REJECTED: "article.rejected",
    ARTICLE_CHANGES_REQUESTED: "article.changes_requested",
    CATEGORY_CREATED: "category.created",
    CATEGORY_UPDATED: "category.updated",
    REPORT_SUBMITTED: "report.submitted",
    REPORT_REVIEWED: "report.reviewed",
  };

  return rows.map((row) => ({
    id: row.id,
    action: actionMap[row.action] ?? "report.submitted",
    actorId: row.actorId,
    actorName: row.actor.name,
    targetType: row.targetType as AuditEvent["targetType"],
    targetId: row.targetId,
    targetLabel: row.targetLabel,
    timestamp: row.timestamp.toISOString(),
    details: row.details ?? undefined,
  }));
}

export type SearchResult = {
  type: "article" | "media";
  id: string;
  slug?: string;
  title: string;
  category?: string;
  excerpt: string;
};

export async function searchContent(query: string): Promise<SearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const [articles, media] = await Promise.all([
    getArticles({ query: term, limit: 20 }),
    getMediaItems(),
  ]);

  const lowered = term.toLowerCase();

  const articleResults: SearchResult[] = articles.map((article) => ({
    type: "article",
    id: article.id,
    slug: article.slug,
    title: article.title,
    category: article.categoryName,
    excerpt: article.summary,
  }));

  const mediaResults: SearchResult[] = media
    .filter(
      (item) =>
        item.title.toLowerCase().includes(lowered) ||
        item.description.toLowerCase().includes(lowered)
    )
    .map((item) => ({
      type: "media",
      id: item.id,
      title: item.title,
      excerpt: item.description,
    }));

  return [...articleResults, ...mediaResults].slice(0, 20);
}
