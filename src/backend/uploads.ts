import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export type UploadMetadata = {
  id: string;
  userId: string;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: string;
};

const allowedTypes: Record<string, { extension: string; matches: (bytes: Uint8Array) => boolean }> = {
  "application/pdf": { extension: "pdf", matches: (b) => b.length >= 5 && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" },
  "image/jpeg": { extension: "jpg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: "png", matches: (b) => b.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v) },
  "image/webp": { extension: "webp", matches: (b) => b.length >= 12 && new TextDecoder().decode(b.slice(0, 4)) === "RIFF" && new TextDecoder().decode(b.slice(8, 12)) === "WEBP" },
};

export async function saveUpload(file: File, userId: string) {
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) throw new Error("Choose a file smaller than 8 MB.");
  const type = allowedTypes[file.type];
  if (!type) throw new Error("Upload a PDF, JPG, PNG, or WEBP file.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.matches(bytes)) throw new Error("The file contents do not match the selected file type.");

  const id = randomUUID();
  const metadata: UploadMetadata = {
    id,
    userId,
    mimeType: file.type,
    size: bytes.byteLength,
    originalName: file.name.slice(0, 180),
    createdAt: new Date().toISOString(),
  };
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, `${id}.${type.extension}`), bytes, { flag: "wx" });
  await writeFile(path.join(UPLOAD_DIR, `${id}.json`), JSON.stringify(metadata), { flag: "wx" });
  return metadata;
}

export async function getUpload(id: string): Promise<UploadMetadata | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    return JSON.parse(await readFile(path.join(UPLOAD_DIR, `${id}.json`), "utf8")) as UploadMetadata;
  } catch {
    return null;
  }
}

export async function readUpload(id: string, mimeType: string) {
  const extension = Object.entries(allowedTypes).find(([mime]) => mime === mimeType)?.[1].extension;
  if (!extension) return null;
  try {
    return await readFile(path.join(UPLOAD_DIR, `${id}.${extension}`));
  } catch {
    return null;
  }
}

export async function deleteUpload(id: string, mimeType: string) {
  const extension = Object.entries(allowedTypes).find(([mime]) => mime === mimeType)?.[1].extension;
  if (!extension) return;
  await Promise.all([
    rm(path.join(UPLOAD_DIR, `${id}.${extension}`), { force: true }),
    rm(path.join(UPLOAD_DIR, `${id}.json`), { force: true }),
  ]);
}
