import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { toArticleStatus, toDbArticleStatus } from "@/backend/mappers";
import { getArticleById, getArticleBySlug } from "@/backend/queries";
import type { ArticleStatus } from "@/types";

const EDITOR_ROLES = ["Editor", "Administrator"];

const statusActions: Partial<Record<ArticleStatus, string>> = {
  submitted: "ARTICLE_SUBMITTED",
  approved: "ARTICLE_APPROVED",
  rejected: "ARTICLE_REJECTED",
  changes_requested: "ARTICLE_CHANGES_REQUESTED",
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const article = (await getArticleBySlug(id)) ?? (await getArticleById(id));

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const user = await getAuthenticatedUser(_req);
    const canViewUnpublished = Boolean(
      user && (user.id === article.authorId || ["Editor", "Administrator", "Leadership"].includes(user.role))
    );
    if (article.status !== "published" && !canViewUnpublished) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load the article" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const status = typeof body?.status === "string" ? (body.status as ArticleStatus) : "";

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const isAuthor = article.authorId === user.id;
    const isEditor = EDITOR_ROLES.includes(user.role);

    if (!isAuthor && !isEditor) {
      return NextResponse.json({ error: "You do not have access to this resource" }, { status: 403 });
    }

    if (body && ("title" in body || "summary" in body || "content" in body || "categoryId" in body || "image" in body)) {
      if (!isAuthor && !isEditor) return NextResponse.json({ error: "You cannot edit this article." }, { status: 403 });
      const title = typeof body.title === "string" ? body.title.trim() : article.title;
      const summary = typeof body.summary === "string" ? body.summary.trim() : article.summary;
      const content = typeof body.content === "string" ? body.content.trim() : article.content;
      const categoryId = typeof body.categoryId === "string" ? body.categoryId : article.categoryId;
      if (title.length < 5 || title.length > 200 || summary.length < 10 || !content) return NextResponse.json({ error: "Enter a valid title, summary, and article body." }, { status: 400 });
      if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) return NextResponse.json({ error: "Choose an existing topic." }, { status: 400 });
      const newSlugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `article-${Date.now()}`;
      let slug = newSlugBase;
      let suffix = 1;
      while (slug !== article.slug && await prisma.article.findUnique({ where: { slug }, select: { id: true } })) slug = `${newSlugBase}-${suffix++}`;
      const updated = await prisma.article.update({ where: { id }, data: {
        title, slug, summary, content, categoryId,
        image: typeof body.image === "string" && body.image.trim() ? body.image.trim() : null,
        imageAlt: typeof body.imageAlt === "string" && body.imageAlt.trim() ? body.imageAlt.trim() : null,
      } });
      await prisma.auditEvent.create({ data: { action: "ARTICLE_EDITED", actorId: user.id, targetType: "article", targetId: updated.id, targetLabel: updated.title } });
      return NextResponse.json({ article: { id: updated.id, slug: updated.slug, status: toArticleStatus(updated.status) } });
    }

    if (!status || !["draft", "submitted", "in_review", "changes_requested", "approved", "rejected", "published", "archived"].includes(status)) return NextResponse.json({ error: "Status is required" }, { status: 400 });
    if (status !== "submitted" && status !== "draft" && !isEditor) return NextResponse.json({ error: "Only editors can review articles" }, { status: 403 });

    const dbStatus = toDbArticleStatus(status);
    const publishedAt = dbStatus === "PUBLISHED" ? (article.publishedAt ?? new Date()) : article.publishedAt;

    const updated = await prisma.article.update({
      where: { id },
      data: { status: dbStatus, publishedAt },
    });

    const action = statusActions[status];
    if (action) {
      await prisma.auditEvent.create({
        data: {
          action: action as never,
          actorId: user.id,
          targetType: "article",
          targetId: updated.id,
          targetLabel: updated.title,
        },
      });
    }

    return NextResponse.json({ article: { id: updated.id, status: toArticleStatus(updated.status) } });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to update the article" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (user?.role !== "Administrator") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const { id } = await ctx.params;
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to delete the article." }, { status: 404 });
  }
}
