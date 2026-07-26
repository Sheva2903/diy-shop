import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { RouterProvider, type RouterProviderProps } from "react-router-dom";

import { CartProvider } from "../features/cart/context/CartProvider";
import { SellerSessionProvider } from "../features/seller/auth/SellerSessionProvider";
import i18n from "../shared/i18n/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

type AppProvidersProps = {
  router: RouterProviderProps["router"];
};

export function AppProviders({ router }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <SellerSessionProvider>
            <RouterProvider router={router} />
          </SellerSessionProvider>
        </CartProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
