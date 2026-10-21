import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { readMediaInput } from "@/backend/media-input";

async function admin(req: Request) {
  const user = await getAuthenticatedUser(req);
  return user?.role === "Administrator" ? user : null;
}

export async function GET(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const items = await prisma.mediaItem.findMany({ include: { category: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load media content." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await admin(req))) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const body = await req.json();
    const data = readMediaInput(body);
    if (data.categoryId && !(await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Choose an existing category." }, { status: 400 });
    }
    const item = await prisma.mediaItem.create({ data });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create media content." }, { status: 400 });
  }
}
