import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/auth/guard";
import { saveUpload } from "@/backend/uploads";


export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Send the file as multipart form data." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "The upload could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  try {
    const metadata = await saveUpload(file, user.id);
    return NextResponse.json(
      { upload: { id: metadata.id, name: metadata.originalName, size: metadata.size } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The upload could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
