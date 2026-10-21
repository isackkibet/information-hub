import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { getCategories } from "@/backend/queries";

export async function GET() {
  try {
    const categories = await getCategories(true);
    return NextResponse.json({ categories });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Unable to load categories" }, { status: 500 });
  }
}
