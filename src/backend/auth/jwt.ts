import jwt from "jsonwebtoken";
import type { Role } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.headers.get("cookie")?.match(/sihu_token=([^;]+)/)?.[1] ?? null;
}
