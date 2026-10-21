import type { ArticleStatus, Category, Report, Article } from "@/types";

export function toArticleStatus(value: string): ArticleStatus {
  const map: Record<string, ArticleStatus> = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    IN_REVIEW: "in_review",
    CHANGES_REQUESTED: "changes_requested",
    APPROVED: "approved",
    REJECTED: "rejected",
    PUBLISHED: "published",
    ARCHIVED: "archived",
  };
  return map[value] ?? "draft";
}

export function fromArticleStatus(value: ArticleStatus) {
  const map: Record<ArticleStatus, string> = {
    draft: "DRAFT",
    submitted: "SUBMITTED",
    in_review: "IN_REVIEW",
    changes_requested: "CHANGES_REQUESTED",
    approved: "APPROVED",
    rejected: "REJECTED",
    published: "PUBLISHED",
    archived: "ARCHIVED",
  };
  return map[value];
}

export function toReportStatus(value: string) {
  const map: Record<string, Report["status"]> = {
    SUBMITTED: "submitted",
    UNDER_REVIEW: "under_review",
    NEEDS_INFO: "needs_info",
    VERIFIED: "verified",
    REJECTED: "rejected",
    CLOSED: "closed",
  };
  return map[value] ?? "submitted";
}

export function fromReportStatus(value: Report["status"]) {
  const map: Record<Report["status"], string> = {
    submitted: "SUBMITTED",
    under_review: "UNDER_REVIEW",
    needs_info: "NEEDS_INFO",
    verified: "VERIFIED",
    rejected: "REJECTED",
    closed: "CLOSED",
  };
  return map[value];
}

export function toCategory(category: {
  id: string;
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    enabled: category.enabled,
    order: category.order,
  };
}
