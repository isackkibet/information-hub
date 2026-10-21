import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/database/prisma";
import { signToken } from "@/backend/auth/jwt";
import { toRole } from "@/lib/roles";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
    }

    const role = toRole(user.role);
    const token = signToken({ userId: user.id, email: user.email, role });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (/P1001|Can't reach database server|DATABASE_URL is not set/.test(message)) {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable because the account database cannot be reached." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
