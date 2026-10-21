import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireRole } from "@/backend/auth/guard";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireRole(req, ["Administrator"]);
    if (error || !user) return error;

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : existing.name;
    const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : existing.slug;
    const description =
      typeof body?.description === "string" ? body.description.trim() : existing.description;
    const enabled = typeof body?.enabled === "boolean" ? body.enabled : existing.enabled;
    const order = typeof body?.order === "number" ? body.order : existing.order;

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Name must be between 2 and 80 characters" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug must use lowercase letters, numbers and hyphens" }, { status: 400 });
    }

    const clash = await prisma.category.findUnique({ where: { slug } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, enabled, order },
    });

    await prisma.auditEvent.create({
      data: {
        action: "CATEGORY_UPDATED",
        actorId: user.id,
        targetType: "category",
        targetId: category.id,
        targetLabel: category.name,
        details: `enabled=${category.enabled} order=${category.order}`,
      },
    });

    return NextResponse.json({
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        enabled: category.enabled,
        order: category.order,
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to update the category" }, { status: 500 });
  }
}
