export type Role = "Visitor" | "Registered User" | "Contributor" | "Editor" | "Verifier" | "Administrator" | "Leadership";

export type AccountStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  registeredAt: string;
  avatar?: string;
  lastActive?: string;
}

export type ArticleStatus = "draft" | "submitted" | "in_review" | "changes_requested" | "approved" | "rejected" | "published" | "archived";

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  authorId?: string;
  authorName?: string;
  image?: string;
  imageAlt?: string;
  location?: string;
  status: ArticleStatus;
  publishedAt?: string;
  updatedAt?: string;
  createdAt: string;
  sourceUrl?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}

export type ReportStatus = "submitted" | "under_review" | "needs_info" | "verified" | "rejected" | "closed";

export interface Report {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  location?: string;
  status: ReportStatus;
  submittedAt: string;
  submittedById?: string;
  submittedByName?: string;
  hasAttachment: boolean;
  attachmentUrl?: string;
  notes?: string;
}

export type TaskStatus = "assigned" | "in_progress" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  roleRequired?: Role;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type AuditAction =
  | "user.role_changed"
  | "user.activated"
  | "user.deactivated"
  | "article.created"
  | "article.edited"
  | "article.submitted"
  | "article.approved"
  | "article.rejected"
  | "article.changes_requested"
  | "category.created"
  | "category.updated"
  | "report.submitted"
  | "report.reviewed";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  targetType: "user" | "article" | "category" | "report";
  targetId: string;
  targetLabel: string;
  timestamp: string;
  details?: string;
}

export interface MediaItem {
  id: string;
  type: "radio" | "podcast" | "video" | "newspaper" | "image";
  title: string;
  description: string;
  image?: string;
  mediaUrl?: string;
  duration?: string;
  publishedAt: string;
  category?: string;
  categoryId?: string;
  isPublished: boolean;
}
