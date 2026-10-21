import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireRole } from "@/backend/auth/guard";
import { toRole, toDbRole } from "@/lib/roles";
import type { Role } from "@/types";

const assignableRoles: Role[] = ["Registered User", "Contributor", "Editor", "Verifier", "Administrator", "Leadership"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { user: actor, error } = await requireRole(req, ["Administrator"]);
    if (error || !actor) return error;

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.id === actor.id && (body?.role || body?.status === "suspended")) {
      return NextResponse.json({ error: "You cannot change your own role or suspend your own account" }, { status: 400 });
    }

    const data: { role?: ReturnType<typeof toDbRole>; status?: "ACTIVE" | "SUSPENDED" } = {};

    if (typeof body?.role === "string") {
      const role = body.role as Role;
      if (!assignableRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      data.role = toDbRole(role);
    }

    if (body?.status === "active" || body?.status === "suspended") {
      data.status = body.status === "active" ? "ACTIVE" : "SUSPENDED";
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id }, data });

    await prisma.auditEvent.create({
      data: {
        action: data.role ? "USER_ROLE_CHANGED" : data.status === "SUSPENDED" ? "USER_DEACTIVATED" : "USER_ACTIVATED",
        actorId: actor.id,
        targetType: "user",
        targetId: updated.id,
        targetLabel: updated.email,
        details: data.role ? `Role set to ${toRole(updated.role)}` : `Status set to ${updated.status}`,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: toRole(updated.role),
        status: updated.status === "ACTIVE" ? "active" : "suspended",
      },
    });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to update the user" }, { status: 500 });
  }
}
