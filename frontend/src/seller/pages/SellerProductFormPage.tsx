import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createProduct,
  deleteProduct,
  getSellerCategories,
  getSellerProduct,
  updateProduct,
  type ProductInput,
  type SellerProduct
} from "../../api/seller";
import { Button } from "../../components/ui/Button";
import { ErrorState, Skeleton } from "../../components/ui/Feedback";
import { SelectField, TextAreaField, TextField } from "../../components/ui/Field";
import { ConfirmDialog } from "../../components/ui/Modal";
import { Section } from "../../components/ui/Section";
import { Toggle } from "../../components/ui/Toggle";
import { useToast } from "../../components/ui/toast";
import { formatVnd } from "../../lib/format";
import { ProductImagesPanel } from "../components/ProductImagesPanel";

const SHORT_DESCRIPTION_MAX = 200;

type FormErrors = Partial<Record<keyof ProductInput, string>>;

function toForm(product: SellerProduct | null): ProductInput {
  if (!product) {
    return {
      name_vi: "",
      name_en: "",
      description_vi: "",
      description_en: "",
      price: 0,
      inventory_quantity: 0,
      category_id: 0,
      visible: true
    };
  }

  return {
    name_vi: product.name_vi,
    name_en: product.name_en ?? "",
    description_vi: product.description_vi ?? "",
    description_en: product.description_en ?? "",
    price: Number(product.price),
    inventory_quantity: product.inventory_quantity,
    category_id: product.category_id,
    visible: product.visible
  };
}

function validate(form: ProductInput): FormErrors {
  const errors: FormErrors = {};
  if (!form.name_vi.trim()) errors.name_vi = "Vietnamese name is required";
  if (!form.category_id) errors.category_id = "Choose a category";
  if (!Number.isFinite(form.price) || form.price < 0) errors.price = "Enter a valid price";
  if (!Number.isInteger(form.inventory_quantity) || form.inventory_quantity < 0) {
    errors.inventory_quantity = "Enter a whole number of units";
  }
  return errors;
}

export function SellerProductFormPage() {
  const { productId } = useParams();
  const isEdit = productId !== undefined;
  const id = Number(productId);

  const productQuery = useQuery({
    queryKey: ["seller", "product", id],
    queryFn: () => getSellerProduct(id),
    enabled: isEdit && Number.isFinite(id)
  });

  if (isEdit && productQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-40 rounded-card" />
      </div>
    );
  }

  if (isEdit && productQuery.isError) {
    return <ErrorState title="Could not load this product" description={productQuery.error.message} />;
  }

  // Keyed so switching products remounts the form with fresh field state
  // instead of copying the loaded product in from an effect.
  return <ProductForm key={productId ?? "new"} product={productQuery.data ?? null} />;
}

function ProductForm({ product }: { product: SellerProduct | null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProductInput>(() => toForm(product));
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const categoriesQuery = useQuery({ queryKey: ["seller", "categories"], queryFn: getSellerCategories });

  const saveMutation = useMutation({
    mutationFn: (input: ProductInput) =>
      product ? updateProduct(product.id, input) : createProduct(input),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["seller"] });
      toast.success(product ? "Product saved" : "Product created");
      if (!product) navigate(`/seller/products/${saved.id}`, { replace: true });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller"] });
      toast.success("Product deleted");
      navigate("/seller/products", { replace: true });
    },
    onError: (error: Error) => {
      setConfirmDelete(false);
      toast.error(error.message);
    }
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    saveMutation.mutate(form);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl pb-24">
      <div className="space-y-5">
        {/* ------------------------------------------------- Basic details */}
        <Section
          title="Basic information"
          description="Vietnamese name and category are required; English fields are optional."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Product name (VI)"
              required
              placeholder="Kệ gỗ treo tường"
              value={form.name_vi}
              error={errors.name_vi}
              onChange={(event) => setForm((f) => ({ ...f, name_vi: event.target.value }))}
            />
            <TextField
              label="Product name (EN)"
              placeholder="Wall-mounted wooden shelf"
              value={form.name_en}
              onChange={(event) => setForm((f) => ({ ...f, name_en: event.target.value }))}
            />
            <SelectField
              label="Category"
              required
              value={form.category_id || ""}
              error={errors.category_id}
              onChange={(event) =>
                setForm((f) => ({ ...f, category_id: Number(event.target.value) }))
              }
            >
              <option value="">Select a category</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_vi}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Price (VND)"
              required
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              hint={form.price > 0 ? formatVnd(form.price, "vi") : undefined}
              value={form.price || ""}
              error={errors.price}
              inputClassName="tabular-nums"
              onChange={(event) => setForm((f) => ({ ...f, price: Number(event.target.value) }))}
            />
            <TextField
              label="Inventory quantity"
              required
              type="number"
              min={0}
              placeholder="0"
              value={form.inventory_quantity || ""}
              error={errors.inventory_quantity}
              inputClassName="tabular-nums"
              onChange={(event) =>
                setForm((f) => ({ ...f, inventory_quantity: Number(event.target.value) }))
              }
            />
          </div>

          <div className="mt-4">
            <Toggle
              checked={form.visible}
              onChange={(next) => setForm((f) => ({ ...f, visible: next }))}
              label={form.visible ? "Active" : "Hidden"}
              description={
                form.visible
                  ? "Customers can find and buy this product."
                  : "Hidden from the storefront and from search."
              }
            />
          </div>
        </Section>

        {/* --------------------------------------------------- Descriptions */}
        <Section
          title="Description"
          description={`Shown on the product page. The first ~${SHORT_DESCRIPTION_MAX} characters also appear in listings.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextAreaField
              label="Description (VI)"
              rows={7}
              maxLength={2000}
              hint={`${form.description_vi.length} / 2000`}
              value={form.description_vi}
              onChange={(event) => setForm((f) => ({ ...f, description_vi: event.target.value }))}
            />
            <TextAreaField
              label="Description (EN)"
              rows={7}
              maxLength={2000}
              hint={`${form.description_en.length} / 2000`}
              value={form.description_en}
              onChange={(event) => setForm((f) => ({ ...f, description_en: event.target.value }))}
            />
          </div>
        </Section>

        {/* -------------------------------------------------------- Images */}
        {product ? (
          <ProductImagesPanel productId={product.id} images={product.images} />
        ) : (
          <Section title="Product images" description="Available once the product has been saved.">
            <div className="flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-hairline px-6 py-10 text-center">
              <svg
                viewBox="0 0 24 24"
                className="size-8 text-text-faint"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m4 18 5-5 4 4 3-2.5 4 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[14px] text-text-muted">
                Save the product first — images can be uploaded once it exists.
              </p>
            </div>
          </Section>
        )}
      </div>

      {/* ------------------------------------------------------- Action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
          <Button type="submit" size="lg" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : product ? "Save changes" : "Create product"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate("/seller/products")}
          >
            Cancel
          </Button>

          {product && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto text-[14px] font-semibold text-danger hover:underline"
            >
              Delete product
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete product?"
        description="This cannot be undone. Products that appear in an existing order cannot be deleted — hide them instead."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={deleteMutation.isPending}
      />
    </form>
  );
}
