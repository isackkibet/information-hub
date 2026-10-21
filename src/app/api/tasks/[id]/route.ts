import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireUser } from "@/backend/auth/guard";
import { toDbRole } from "@/lib/roles";
import type { TaskStatus as TaskStatusEnum } from "@/generated/prisma/enums";

const TASK_STATUS: Record<string, TaskStatusEnum> = {
  assigned: "ASSIGNED",
  in_progress: "IN_PROGRESS",
  done: "DONE",
  blocked: "BLOCKED",
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireUser(req);
    if (error || !user) return error;

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const status = typeof body?.status === "string" ? body.status.toLowerCase() : "";

    if (!status || !TASK_STATUS[status]) {
      return NextResponse.json({ error: "Invalid task status" }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const canUpdate =
      user.role === "Administrator" ||
      existing.assigneeId === user.id ||
      (existing.roleRequired !== null && existing.roleRequired === toDbRole(user.role));

    if (!canUpdate) {
      return NextResponse.json({ error: "You cannot update this task" }, { status: 403 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status: TASK_STATUS[status] },
    });

    return NextResponse.json({ task: { id: task.id, status: task.status.toLowerCase() } });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to update the task" }, { status: 500 });
  }
}
