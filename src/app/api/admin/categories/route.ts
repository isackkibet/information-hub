import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireRole } from "@/backend/auth/guard";

export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole(req, ["Administrator"]);
    if (error || !user) return error;

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Name must be between 2 and 80 characters" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug must use lowercase letters, numbers and hyphens" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const count = await prisma.category.count();
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        enabled: body?.enabled === false ? false : true,
        order: typeof body?.order === "number" ? body.order : count + 1,
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: "CATEGORY_CREATED",
        actorId: user.id,
        targetType: "category",
        targetId: category.id,
        targetLabel: category.name,
      },
    });

    return NextResponse.json(
      {
        category: {
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description,
          enabled: category.enabled,
          order: category.order,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to create the category" }, { status: 500 });
  }
}
