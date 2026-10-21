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
      const localSession = getSession();
      if (!localSession.isAuthenticated) {
        setSession(EMPTY);
        setLoading(false);
        return;
      }
      // The login flow has just stored this user locally. Render the signed-in
      // shell immediately while checking the token and account status in the background.
      setSession(localSession);
      setLoading(false);
      const next = await fetchSession();
      if (active) {
        setSession(next);
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
