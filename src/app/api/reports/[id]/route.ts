import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { toDbReportStatus, toReportStatus } from "@/backend/mappers";
import type { ReportStatus } from "@/types";

const STAFF_ROLES = ["Verifier", "Editor", "Administrator", "Leadership"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const status = typeof body?.status === "string" ? (body.status as ReportStatus) : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim() : undefined;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const isSubmitter = report.submittedById === user.id;
    const isStaff = STAFF_ROLES.includes(user.role);

    if (!isStaff && !(isSubmitter && status === "closed")) {
      return NextResponse.json({ error: "You do not have access to this resource" }, { status: 403 });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: toDbReportStatus(status),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: "REPORT_REVIEWED",
        actorId: user.id,
        targetType: "report",
        targetId: updated.id,
        targetLabel: updated.title,
        details: status,
      },
    });

    return NextResponse.json({ report: { id: updated.id, status: toReportStatus(updated.status) } });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to update the report" }, { status: 500 });
  }
}
