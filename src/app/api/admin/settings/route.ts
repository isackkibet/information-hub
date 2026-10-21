import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/backend/database/prisma";
import { requireRole } from "@/backend/auth/guard";

const DEFAULTS: Record<string, string> = {
  siteName: "Sango Information Hub (SIHU)",
  tagline: "We care about Lake Victoria.",
  contactEmail: "",
  contactLocation: "Lake Victoria Basin, Kenya",
};

export async function GET(req: Request) {
  try {
    const { error } = await requireRole(req, ["Administrator"]);
    if (error) return error;

    const rows = await prisma.siteSetting.findMany();
    const settings = { ...DEFAULTS };

    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load the site settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { error } = await requireRole(req, ["Administrator"]);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Send the settings to update" }, { status: 400 });
    }

    const allowed = Object.keys(DEFAULTS);
    const updates: Array<{ key: string; value: string }> = [];

    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (!allowed.includes(key)) continue;
      if (typeof value !== "string") continue;
      updates.push({ key, value: value.slice(0, 500) });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No supported settings were provided" }, { status: 400 });
    }

    await prisma.$transaction(
      updates.map((update) =>
        prisma.siteSetting.upsert({
          where: { key: update.key },
          create: update,
          update: { value: update.value },
        })
      )
    );

    const rows = await prisma.siteSetting.findMany();
    const settings = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to save the site settings" }, { status: 500 });
  }
}
