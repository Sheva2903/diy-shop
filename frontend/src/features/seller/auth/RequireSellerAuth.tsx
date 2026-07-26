import { Navigate } from "react-router-dom";
import { useSellerSession } from "./useSellerSession";

export function RequireSellerAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSellerSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/seller/login" replace />;

  return <>{children}</>;
}
