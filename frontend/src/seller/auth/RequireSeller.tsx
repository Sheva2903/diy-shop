import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useSellerSession } from "./useSellerSession";

export function RequireSeller({ children }: { children: ReactNode }) {
  const { session, isSeller, loading } = useSellerSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="size-8 animate-spin rounded-full border-2 border-hairline border-t-action" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/seller/login" state={{ from: location.pathname }} replace />;
  }

  // Signed in, but without the seller role — every dashboard query would be
  // rejected by RLS, so say so plainly instead of rendering an empty shell.
  if (!isSeller) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <h1 className="text-[20px] font-bold text-text">This account is not a seller</h1>
        <p className="max-w-md text-[15px] text-text-muted">
          Ask an administrator to grant the seller role to this account, then sign in again.
        </p>
        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="rounded-pill bg-ceramic px-6 py-2.5 text-[15px] font-semibold text-text"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
