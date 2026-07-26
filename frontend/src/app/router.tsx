import { createBrowserRouter } from "react-router-dom";

import { CartPage } from "../features/cart/pages/CartPage";
import { CatalogPage } from "../features/catalog/pages/CatalogPage";
import { CheckoutPage } from "../features/checkout/pages/CheckoutPage";
import { OrderConfirmationPage } from "../features/checkout/pages/OrderConfirmationPage";
import { OrderTrackingPage } from "../features/order-tracking/pages/OrderTrackingPage";
import { ProductDetailPage } from "../features/product-detail/pages/ProductDetailPage";
import { RequireSellerAuth } from "../features/seller/auth/RequireSellerAuth";
import { SellerLoginPage } from "../features/seller/auth/SellerLoginPage";
import { SellerLayout } from "../features/seller/layout/SellerLayout";
import { SellerCategoriesPage } from "../features/seller/pages/SellerCategoriesPage";
import { SellerDashboardPage } from "../features/seller/pages/SellerDashboardPage";
import { SellerOrderDetailPage } from "../features/seller/pages/SellerOrderDetailPage";
import { SellerOrdersPage } from "../features/seller/pages/SellerOrdersPage";
import { SellerProductFormPage } from "../features/seller/pages/SellerProductFormPage";
import { SellerProductsPage } from "../features/seller/pages/SellerProductsPage";
import { AppLayout } from "../shared/components/AppLayout";
import { NotFoundPage } from "../shared/components/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/success", element: <OrderConfirmationPage /> },
      { path: "track", element: <OrderTrackingPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  },
  { path: "seller/login", element: <SellerLoginPage /> },
  {
    path: "seller",
    element: (
      <RequireSellerAuth>
        <SellerLayout />
      </RequireSellerAuth>
    ),
    children: [
      { index: true, element: <SellerDashboardPage /> },
      { path: "dashboard", element: <SellerDashboardPage /> },
      { path: "categories", element: <SellerCategoriesPage /> },
      { path: "products", element: <SellerProductsPage /> },
      { path: "products/new", element: <SellerProductFormPage /> },
      { path: "products/:productId", element: <SellerProductFormPage /> },
      { path: "orders", element: <SellerOrdersPage /> },
      { path: "orders/:orderCode", element: <SellerOrderDetailPage /> }
    ]
  }
]);
