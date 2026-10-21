import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { requireRole } from "@/backend/auth/guard";
import { getAuditEvents } from "@/backend/queries";

export async function GET(req: Request) {
  try {
    const { error } = await requireRole(req, ["Administrator", "Leadership"]);
    if (error) return error;

    const events = await getAuditEvents();

    return NextResponse.json({ events });
  } catch (err) {
    unstable_rethrow(err);
    return NextResponse.json({ error: "Unable to load the audit trail" }, { status: 500 });
  }
}
