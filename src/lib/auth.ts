import type { Role } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = "sihu_token";
const USER_KEY = "sihu_user";
const AUTH_EVENT = "sihu-auth-change";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getSession(): AuthSession {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return { user: null, isAuthenticated: false };
  return { user, isAuthenticated: true };
}

export function setSession(user: AuthUser, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifySessionChanged();
}

// Shared client layouts and route guards still use these older helper names.
export const getDemoSession = getSession;
export const clearDemoSession = clearSession;

export function onSessionChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function notifySessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Unable to sign in");

  setSession(data.user, data.token);
  return data.user;
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Unable to create account");

  setSession(data.user, data.token);
  return data.user;
}

export async function fetchSession(): Promise<AuthSession> {
  const token = getStoredToken();
  if (!token) return { user: null, isAuthenticated: false };

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      clearSession();
      return { user: null, isAuthenticated: false };
    }

    const data = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return { user: data.user, isAuthenticated: true };
  } catch {
    return getSession();
  }
}
