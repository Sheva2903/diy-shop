import { createBrowserRouter } from "react-router-dom";

import { CatalogPage } from "../features/catalog/pages/CatalogPage";
import { ProductDetailPage } from "../features/product-detail/pages/ProductDetailPage";
import { AppLayout } from "../shared/components/AppLayout";
import { NotFoundPage } from "../shared/components/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
