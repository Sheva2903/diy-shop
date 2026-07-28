import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  deleteProduct,
  getSellerCategories,
  getSellerProducts,
  updateProduct,
  type SellerProduct
} from "../../api/seller";
import { Badge } from "../../components/ui/Badge";
import { ButtonLink, IconButton } from "../../components/ui/Button";
import { EmptyState, ErrorState, TableRowSkeleton } from "../../components/ui/Feedback";
import { SelectField, TextField } from "../../components/ui/Field";
import { ConfirmDialog } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/toast";
import { formatVnd } from "../../lib/format";

const LOW_STOCK_THRESHOLD = 5;

type StatusFilter = "all" | "active" | "hidden" | "outOfStock";

export function SellerProductsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<SellerProduct | null>(null);

  const productsQuery = useQuery({ queryKey: ["seller", "products"], queryFn: getSellerProducts });
  const categoriesQuery = useQuery({ queryKey: ["seller", "categories"], queryFn: getSellerCategories });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["seller"] });
  };

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) => updateProduct(id, { visible }),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.visible ? "Product is now visible" : "Product hidden");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Product deleted");
    },
    onError: (error: Error) => {
      setPendingDelete(null);
      toast.error(error.message);
    }
  });

  const products = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    return (productsQuery.data ?? []).filter((product) => {
      if (term && !`${product.name_vi} ${product.name_en}`.toLowerCase().includes(term)) return false;
      if (categoryId && String(product.category_id) !== categoryId) return false;
      if (status === "active" && !product.visible) return false;
      if (status === "hidden" && product.visible) return false;
      if (status === "outOfStock" && product.inventory_quantity > 0) return false;
      return true;
    });
  }, [productsQuery.data, keyword, categoryId, status]);

  if (productsQuery.isError) {
    return <ErrorState title="Could not load products" description={productsQuery.error.message} />;
  }

  return (
    <div className="space-y-5">
      {/* -------------------------------------------------------- A. Toolbar */}
      <div className="rounded-card bg-surface p-4 shadow-card lg:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] xl:items-end">
          <TextField
            label="Search"
            placeholder="Product name..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <SelectField
            label="Category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">All categories</option>
            {categoriesQuery.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_vi}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="outOfStock">Out of stock</option>
          </SelectField>

          <ButtonLink to="/seller/products/new" className="max-sm:w-full">
            Add product
          </ButtonLink>
        </div>
      </div>

      {/* --------------------------------------------------- B. Product table */}
      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-hairline bg-canvas/60 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {productsQuery.isPending ? (
                Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={index} columns={7} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No products yet"
                      description="Add your first product to start selling."
                      action={<ButtonLink to="/seller/products/new">Add product</ButtonLink>}
                      className="shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="cursor-pointer text-[14px] transition-colors hover:bg-canvas"
                    onClick={() => navigate(`/seller/products/${product.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="size-12 overflow-hidden rounded-lg bg-ceramic">
                        {product.images[0] && (
                          <img src={product.images[0].image_url} alt="" className="size-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">{product.name_vi}</p>
                      {product.name_en && <p className="text-[13px] text-text-muted">{product.name_en}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {product.category && <Badge>{product.category.name_vi}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-text tabular-nums">
                      {formatVnd(product.price, "vi")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={
                          product.inventory_quantity <= LOW_STOCK_THRESHOLD
                            ? "font-bold text-danger"
                            : "text-text"
                        }
                      >
                        {product.inventory_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={product.visible ? "mint" : "neutral"}>
                        {product.visible ? "Active" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          aria-label={`Edit ${product.name_vi}`}
                          onClick={() => navigate(`/seller/products/${product.id}`)}
                        >
                          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
                          </svg>
                        </IconButton>

                        <IconButton
                          aria-label={product.visible ? `Hide ${product.name_vi}` : `Show ${product.name_vi}`}
                          disabled={visibilityMutation.isPending}
                          onClick={() =>
                            visibilityMutation.mutate({ id: product.id, visible: !product.visible })
                          }
                        >
                          {product.visible ? (
                            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                              <path d="M4 4l16 16M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.4 8.3A16 16 0 0 0 2.5 12S6 18.5 12 18.5c.9 0 1.7-.1 2.5-.4" />
                            </svg>
                          )}
                        </IconButton>

                        <IconButton
                          aria-label={`Delete ${product.name_vi}`}
                          tone="danger"
                          onClick={() => setPendingDelete(product)}
                        >
                          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!productsQuery.isPending && products.length > 0 && (
        <p className="text-[13px] text-text-muted">
          {products.length} of {productsQuery.data?.length ?? 0} products
        </p>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        title="Delete product?"
        description={
          pendingDelete
            ? `"${pendingDelete.name_vi}" will be removed permanently. Products that appear in an existing order cannot be deleted — hide them instead.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={deleteMutation.isPending}
      />

      <p className="text-[13px] text-text-muted">
        Need to change stock quickly? Open a product and edit its inventory, or{" "}
        <Link to="/seller/categories" className="font-semibold text-action hover:underline">
          manage categories
        </Link>
        .
      </p>
    </div>
  );
}
