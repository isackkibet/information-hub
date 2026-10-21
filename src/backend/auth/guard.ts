import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { extractToken, verifyToken } from "@/backend/auth/jwt";
import { toRole } from "@/lib/roles";
import type { Role } from "@/types";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status === "SUSPENDED") return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toRole(user.role),
  };
}

export async function requireUser(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requireRole(req: Request, allowed: Role[]) {
  const result = await requireUser(req);
  if (result.error || !result.user) {
    return { user: null, error: result.error };
  }

  if (!allowed.includes(result.user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "You do not have access to this resource" }, { status: 403 }),
    };
  }

  return { user: result.user, error: null };
}
