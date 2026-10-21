import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { getArticles } from "@/backend/queries";

const ARTICLE_STATUSES = ["draft", "submitted", "in_review", "changes_requested", "approved", "rejected", "published", "archived"];
const REVIEW_ROLES = ["Editor", "Administrator", "Leadership"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedStatus = searchParams.get("status")?.toLowerCase();
    const user = await getAuthenticatedUser(req);
    const canReview = Boolean(user && REVIEW_ROLES.includes(user.role));

    if (requestedStatus && !ARTICLE_STATUSES.includes(requestedStatus)) {
      return NextResponse.json({ error: "Invalid article status" }, { status: 400 });
    }
    if (requestedStatus && requestedStatus !== "published" && !canReview) {
      return NextResponse.json({ error: "You do not have access to these articles" }, { status: 403 });
    }

    const status = requestedStatus ?? (canReview ? undefined : "published");
    const categorySlug = searchParams.get("category") ?? undefined;
    const query = searchParams.get("q")?.trim() || undefined;
    const requestedLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 100)
      : 50;

    const articles = await getArticles({ status, categorySlug, query, limit });

    return NextResponse.json({ articles });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load articles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
    const location = typeof body?.location === "string" ? body.location.trim() : "";
    const sourceUrl = typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const imageAlt = typeof body?.imageAlt === "string" ? body.imageAlt.trim() : "";

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json({ error: "Title must be between 5 and 200 characters" }, { status: 400 });
    }
    if (summary.length < 10) {
      return NextResponse.json({ error: "Summary must be at least 10 characters" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Article body is required" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Choose a topic for the article" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
    }

    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    let slug = slugBase || `article-${Date.now()}`;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugBase}-${counter++}`;
    }

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        summary,
        content,
        categoryId,
        location: location || null,
        sourceUrl: sourceUrl || null,
        image: image || null,
        imageAlt: imageAlt || null,
        authorId: user.id,
        status: "DRAFT",
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: "ARTICLE_CREATED",
        actorId: user.id,
        targetType: "article",
        targetId: article.id,
        targetLabel: article.title,
      },
    });

    return NextResponse.json(
      { article: { id: article.id, slug: article.slug, status: "draft" } },
      { status: 201 }
    );
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to create the article" }, { status: 500 });
  }
}
