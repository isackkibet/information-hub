import type { ArticleStatus as ArticleStatusEnum, ReportStatus as ReportStatusEnum } from "@/generated/prisma/enums";
import type { ArticleStatus, Category, Report } from "@/types";

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

export function toDbArticleStatus(value: ArticleStatus): ArticleStatusEnum {
  const map: Record<ArticleStatus, ArticleStatusEnum> = {
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

export function toDbReportStatus(value: Report["status"]): ReportStatusEnum {
  const map: Record<Report["status"], ReportStatusEnum> = {
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
