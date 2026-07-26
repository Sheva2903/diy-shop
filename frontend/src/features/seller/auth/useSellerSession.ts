import { useContext } from "react";

import { SellerSessionContext, type SellerSessionValue } from "./sellerSessionContext";

export function useSellerSession(): SellerSessionValue {
  const context = useContext(SellerSessionContext);

  if (!context) {
    throw new Error("useSellerSession must be used inside SellerSessionProvider");
  }

  return context;
}
