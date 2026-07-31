import { createBrowserRouter } from "react-router-dom";

import { RequireSeller } from "../seller/auth/RequireSeller";
import { SellerLoginPage } from "../seller/auth/SellerLoginPage";
import { SellerLayout } from "../seller/layout/SellerLayout";
import { SellerCategoriesPage } from "../seller/pages/SellerCategoriesPage";
import { SellerOrderDetailPage } from "../seller/pages/SellerOrderDetailPage";
import { SellerOrdersPage } from "../seller/pages/SellerOrdersPage";
import { SellerOverviewPage } from "../seller/pages/SellerOverviewPage";
import { SellerProductFormPage } from "../seller/pages/SellerProductFormPage";
import { SellerProductsPage } from "../seller/pages/SellerProductsPage";
import { SellerSettingsPage } from "../seller/pages/SellerSettingsPage";
import { StoreLayout } from "../storefront/layout/StoreLayout";
import { CartPage } from "../storefront/pages/CartPage";
import { CatalogPage } from "../storefront/pages/CatalogPage";
import { CheckoutPage } from "../storefront/pages/CheckoutPage";
import { HomePage } from "../storefront/pages/HomePage";
import { NotFoundPage } from "../storefront/pages/NotFoundPage";
import { OrderConfirmationPage } from "../storefront/pages/OrderConfirmationPage";
import { OrderLookupPage } from "../storefront/pages/OrderLookupPage";
import { ProductDetailPage } from "../storefront/pages/ProductDetailPage";

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <CatalogPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/success", element: <OrderConfirmationPage /> },
      { path: "track", element: <OrderLookupPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  },
  { path: "seller/login", element: <SellerLoginPage /> },
  {
    path: "seller",
    element: (
      <RequireSeller>
        <SellerLayout />
      </RequireSeller>
    ),
    children: [
      { index: true, element: <SellerOverviewPage /> },
      { path: "products", element: <SellerProductsPage /> },
      { path: "products/new", element: <SellerProductFormPage /> },
      { path: "products/:productId", element: <SellerProductFormPage /> },
      { path: "categories", element: <SellerCategoriesPage /> },
      { path: "orders", element: <SellerOrdersPage /> },
      { path: "orders/:orderCode", element: <SellerOrderDetailPage /> },
      { path: "settings", element: <SellerSettingsPage /> }
    ]
  }
]);
