import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { extractToken, verifyToken } from "@/backend/auth/jwt";
import { toRole } from "@/lib/roles";

export async function PATCH(req: Request) {
  try {
    const token = extractToken(req);
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Session expired" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { name },
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: toRole(user.role) },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
