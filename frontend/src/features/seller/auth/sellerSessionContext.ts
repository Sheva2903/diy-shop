import { createContext } from "react";

export type SellerSessionValue = {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const SellerSessionContext = createContext<SellerSessionValue | null>(null);
