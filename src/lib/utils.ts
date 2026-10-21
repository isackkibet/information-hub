import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
