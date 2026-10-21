"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSession, getSession, onSessionChanged, type AuthSession } from "@/lib/auth";

const EMPTY: AuthSession = { user: null, isAuthenticated: false };

export function useSession() {
  const [session, setSession] = useState<AuthSession>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchSession();
    setSession(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const tokenPresent = getSession().isAuthenticated;
      if (!tokenPresent) {
        setSession(EMPTY);
        setLoading(false);
        return;
      }
      const next = await fetchSession();
      if (active) {
        setSession(next);
        setLoading(false);
      }
    })();

    const unsubscribe = onSessionChanged(() => {
      if (!active) return;
      const local = getSession();
      setSession(local);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { session, loading, refresh };
}
