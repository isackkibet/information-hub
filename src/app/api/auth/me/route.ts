import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { extractToken, verifyToken } from "@/backend/auth/jwt";
import { toRole } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: toRole(user.role),
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
