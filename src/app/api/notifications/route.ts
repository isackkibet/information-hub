import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireUser } from "@/backend/auth/guard";
import { getNotifications } from "@/backend/queries";

export async function GET(req: Request) {
  try {
    const { user, error } = await requireUser(req);
    if (error || !user) return error;

    const notifications = await getNotifications(user.id);

    return NextResponse.json({ notifications });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, error } = await requireUser(req);
    if (error || !user) return error;

    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to update the notification" }, { status: 500 });
  }
}
