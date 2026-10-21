import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { getUpload } from "@/backend/uploads";
import { toReportStatus } from "@/backend/mappers";
import { getReports } from "@/backend/queries";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isStaff = ["Administrator", "Editor", "Verifier", "Leadership"].includes(user.role);

    const reports = await getReports(isStaff ? {} : { submittedById: user.id });

    return NextResponse.json({ reports });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
    const location = typeof body?.location === "string" ? body.location.trim() : "";
    const attachmentId = typeof body?.attachmentId === "string" ? body.attachmentId : "";

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, description and category are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Unknown category" }, { status: 400 });
    }

    let attachmentUrl: string | null = null;
    if (attachmentId) {
      const upload = await getUpload(attachmentId);
      if (!upload || upload.userId !== user.id) {
        return NextResponse.json({ error: "The attachment is invalid or belongs to another account." }, { status: 400 });
      }
      const alreadyAttached = await prisma.report.findFirst({ where: { attachmentUrl: `/api/uploads/${attachmentId}` } });
      if (alreadyAttached) {
        return NextResponse.json({ error: "This attachment has already been used." }, { status: 400 });
      }
      attachmentUrl = `/api/uploads/${attachmentId}`;
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        categoryId,
        location: location || null,
        submittedById: user.id,
        hasAttachment: Boolean(attachmentUrl),
        attachmentUrl,
        status: "SUBMITTED",
      },
    });

    await prisma.auditEvent.create({
      data: {
        action: "REPORT_SUBMITTED",
        actorId: user.id,
        targetType: "report",
        targetId: report.id,
        targetLabel: report.title,
      },
    });

    return NextResponse.json({ report: { id: report.id, status: toReportStatus(report.status) } }, { status: 201 });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to submit the report" }, { status: 500 });
  }
}
