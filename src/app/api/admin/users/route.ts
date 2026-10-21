import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/database/prisma";
import { requireRole } from "@/backend/auth/guard";
import { toDbRole, toRole } from "@/lib/roles";
import { getUsers } from "@/backend/queries";
import type { Role } from "@/types";

const assignableRoles: Role[] = ["Registered User", "Contributor", "Editor", "Verifier", "Administrator", "Leadership"];

export async function GET(req: Request) {
  try {
    const { error } = await requireRole(req, ["Administrator"]);
    if (error) return error;

    const users = await getUsers();

    return NextResponse.json({ users });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { error } = await requireRole(req, ["Administrator"]);
    if (error) return error;

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = typeof body?.role === "string" ? body.role as Role : "Registered User";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: "Password must be between 8 and 72 characters" }, { status: 400 });
    }
    if (!assignableRoles.includes(role)) {
      return NextResponse.json({ error: "Choose a valid account role" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: toDbRole(role) },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: toRole(user.role),
        status: "active",
        registeredAt: user.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    unstable_rethrow(error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : String(error);
    if (/P1001|Can't reach database server|DATABASE_URL is not set/.test(message)) {
      return NextResponse.json({ error: "User creation is temporarily unavailable because the account database cannot be reached." }, { status: 503 });
    }
    return NextResponse.json({ error: "Unable to create the user" }, { status: 500 });
  }
}
