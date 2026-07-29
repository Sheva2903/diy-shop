import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useSellerSession } from "./useSellerSession";

export function RequireSeller({ children }: { children: ReactNode }) {
  const { isSeller, loading } = useSellerSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="size-8 animate-spin rounded-full border-2 border-hairline border-t-action" />
      </div>
    );
  }

  if (!isSeller) {
    return <Navigate to="/seller/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
