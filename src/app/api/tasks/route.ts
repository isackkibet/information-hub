import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { requireUser } from "@/backend/auth/guard";
import { toDbRole } from "@/lib/roles";
import { getTasks } from "@/backend/queries";

export async function GET(req: Request) {
  try {
    const { user, error } = await requireUser(req);
    if (error || !user) return error;

    const isAdmin = user.role === "Administrator";

    const tasks = await getTasks({
      includeAll: isAdmin,
      assigneeId: user.id,
      roleRequired: toDbRole(user.role),
    });

    return NextResponse.json({ tasks });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to load tasks" }, { status: 500 });
  }
}
