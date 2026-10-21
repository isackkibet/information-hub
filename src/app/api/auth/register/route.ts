import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/database/prisma";
import { signToken } from "@/backend/auth/jwt";
import { toRole } from "@/lib/roles";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "REGISTERED_USER" },
    });

    const role = toRole(user.role);
    const token = signToken({ userId: user.id, email: user.email, role });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role }, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (/P1001|Can't reach database server|DATABASE_URL is not set/.test(message)) {
      return NextResponse.json(
        { error: "Account creation is temporarily unavailable because the account database cannot be reached." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
