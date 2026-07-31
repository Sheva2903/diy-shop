import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getSellerSession } from "../../api/auth";

export type SellerSessionState = {
  isSeller: boolean;
  username: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * There is a single static seller account (SellerProperties), no role tiers,
 * so "authenticated" and "is a seller" are the same thing here. Spring
 * Security has no push-based auth-state event, so callers must invoke
 * refresh() after login/logout to pick up the new state.
 */
export function useSellerSession(): SellerSessionState {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({ queryKey: ["seller", "session"], queryFn: getSellerSession });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["seller", "session"] });
  };

  return {
    isSeller: !!sessionQuery.data,
    username: sessionQuery.data?.username ?? null,
    loading: sessionQuery.isPending,
    refresh
  };
}
