import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { prisma } from "@/backend/database/prisma";
import { deleteUpload, getUpload, readUpload } from "@/backend/uploads";


export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);

  const { id } = await context.params;
  const upload = await getUpload(id);
  if (!upload) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });

  const report = await prisma.report.findFirst({ where: { attachmentUrl: `/api/uploads/${id}` } });
  const publicMediaImage = upload.mimeType.startsWith("image/")
    ? await prisma.mediaItem.findFirst({ where: { image: `/api/uploads/${id}`, isPublished: true }, select: { id: true } })
    : null;
  const publicArticleImage = upload.mimeType.startsWith("image/")
    ? await prisma.article.findFirst({ where: { image: `/api/uploads/${id}`, status: "PUBLISHED" }, select: { id: true } })
    : null;
  if (!report && !publicMediaImage && !publicArticleImage) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  if (report) {
    if (!user) return NextResponse.json({ error: "Sign in to access this attachment." }, { status: 401 });
    const isStaff = ["Administrator", "Editor", "Verifier", "Leadership"].includes(user.role);
    if (!isStaff && (report.submittedById !== user.id || upload.userId !== user.id)) {
      return NextResponse.json({ error: "You cannot access this attachment." }, { status: 403 });
    }
  }

  const bytes = await readUpload(id, upload.mimeType);
  if (!bytes) return NextResponse.json({ error: "Attachment file is missing." }, { status: 404 });
  const safeName = encodeURIComponent(upload.originalName.replace(/[\r\n\"]+/g, "_"));

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${publicMediaImage || publicArticleImage ? "inline" : "attachment"}; filename*=UTF-8''${safeName}`,
      "Cache-Control": publicMediaImage || publicArticleImage ? "public, max-age=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Sign in before removing an attachment." }, { status: 401 });
  const { id } = await context.params;
  const upload = await getUpload(id);
  if (!upload || upload.userId !== user.id) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  const linkedReport = await prisma.report.findFirst({ where: { attachmentUrl: `/api/uploads/${id}` } });
  if (linkedReport) return NextResponse.json({ error: "This attachment is already part of a submitted report." }, { status: 409 });
  const linkedMedia = await prisma.mediaItem.findFirst({ where: { image: `/api/uploads/${id}` }, select: { id: true } });
  if (linkedMedia) return NextResponse.json({ error: "This photo is currently used by published media content." }, { status: 409 });
  const linkedArticle = await prisma.article.findFirst({ where: { image: `/api/uploads/${id}` }, select: { id: true } });
  if (linkedArticle) return NextResponse.json({ error: "This photo is currently attached to an article." }, { status: 409 });
  await deleteUpload(id, upload.mimeType);
  return NextResponse.json({ ok: true });
}
