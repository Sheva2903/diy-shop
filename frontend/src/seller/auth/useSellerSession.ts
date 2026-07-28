import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

export type SellerSession = {
  session: Session | null;
  isSeller: boolean;
  email: string | null;
  loading: boolean;
};

/**
 * The seller role lives in app_metadata, which only the service key can write,
 * so a signed-in customer cannot promote themselves. The database enforces the
 * same check in is_seller() — this hook only decides what UI to render.
 */
function readIsSeller(session: Session | null): boolean {
  return session?.user.app_metadata?.role === "seller";
}

export function useSellerSession(): SellerSession {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isSeller: readIsSeller(session),
    email: session?.user.email ?? null,
    loading
  };
}
