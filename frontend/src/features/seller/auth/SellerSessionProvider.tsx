import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import * as sellerAuthApi from "../api/sellerAuthApi";
import { SellerSessionContext, type SellerSessionValue } from "./sellerSessionContext";

export function SellerSessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    sellerAuthApi
      .getSession(controller.signal)
      .then((session) => setUsername(session.username))
      .catch(() => setUsername(null))
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (nextUsername: string, password: string) => {
    await sellerAuthApi.login(nextUsername, password);
    const session = await sellerAuthApi.getSession();
    setUsername(session.username);
  }, []);

  const logout = useCallback(async () => {
    await sellerAuthApi.logout();
    setUsername(null);
  }, []);

  const value = useMemo<SellerSessionValue>(
    () => ({
      username,
      isAuthenticated: username !== null,
      isLoading,
      login,
      logout
    }),
    [username, isLoading, login, logout]
  );

  return <SellerSessionContext.Provider value={value}>{children}</SellerSessionContext.Provider>;
}
