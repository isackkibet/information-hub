import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { getMediaItems } from "@/backend/queries";

const MEDIA_TYPES: Record<string, string> = {
  radio: "radio",
  podcast: "podcast",
  video: "video",
  newspaper: "newspaper",
  image: "image",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const wanted = type ? MEDIA_TYPES[type] : undefined;

    const items = await getMediaItems();
    const filtered = wanted ? items.filter((item) => item.type === wanted) : items;

    return NextResponse.json({ items: filtered });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load media" }, { status: 500 });
  }
}
