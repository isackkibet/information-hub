import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { readMediaInput } from "@/backend/media-input";

async function isAdmin(req: Request) {
  const user = await getAuthenticatedUser(req);
  return user?.role === "Administrator";
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const { id } = await ctx.params;
    const data = readMediaInput(await req.json());
    if (data.categoryId && !(await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Choose an existing category." }, { status: 400 });
    }
    const item = await prisma.mediaItem.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update media content." }, { status: 400 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const { id } = await ctx.params;
    await prisma.mediaItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to delete this media item." }, { status: 404 });
  }
}
