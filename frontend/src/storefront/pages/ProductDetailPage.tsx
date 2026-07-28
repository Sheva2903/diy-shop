import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { getProduct, getRelatedProducts } from "../../api/catalog";
import { Badge } from "../../components/ui/Badge";
import { Button, ButtonLink } from "../../components/ui/Button";
import { ErrorState, Skeleton } from "../../components/ui/Feedback";
import { QuantityStepper } from "../../components/ui/QuantityStepper";
import { useToast } from "../../components/ui/toast";
import { useCart } from "../../features/cart/CartProvider";
import { cn } from "../../lib/cn";
import { formatVnd } from "../../lib/format";
import { localizeDescription, localizeName } from "../../lib/localize";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";

const LOW_STOCK_THRESHOLD = 5;

function ShippingNote({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-[14px] text-text-muted">
      <span className="text-action">{icon}</span>
      {children}
    </li>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();

  // Keyed on the route param so quantity and gallery selection start fresh for
  // each product instead of being reset from an effect.
  return <ProductDetailView key={productId} id={Number(productId)} />;
}

function ProductDetailView({ id }: { id: number }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: Number.isFinite(id)
  });

  const product = productQuery.data;

  const relatedQuery = useQuery({
    queryKey: ["related", product?.category?.id, id],
    queryFn: () => getRelatedProducts(product!.category!.id, id),
    enabled: !!product?.category?.id
  });

  if (productQuery.isPending) {
    return (
      <div className="shell grid gap-10 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-card" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-48 rounded-pill" />
        </div>
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="section shell">
        <ErrorState
          title={t("product.notFoundTitle")}
          description={t("product.notFoundDescription")}
          action={<ButtonLink to="/products">{t("nav.catalog")}</ButtonLink>}
        />
      </div>
    );
  }

  const name = localizeName({ nameVi: product.name_vi, nameEn: product.name_en }, i18n.language);
  const description = localizeDescription(
    {
      nameVi: product.name_vi,
      nameEn: product.name_en,
      descriptionVi: product.description_vi ?? "",
      descriptionEn: product.description_en ?? ""
    },
    i18n.language
  );
  const categoryName = product.category
    ? localizeName(
        { nameVi: product.category.name_vi, nameEn: product.category.name_en },
        i18n.language
      )
    : "";

  const outOfStock = product.inventory_quantity <= 0;
  const images = product.images.length ? product.images : [];

  const addToCart = () => {
    addItem({
      productId: product.id,
      nameVi: product.name_vi,
      nameEn: product.name_en,
      price: product.price,
      primaryImageUrl: product.primaryImageUrl,
      quantity,
      inventoryQuantity: product.inventory_quantity
    });
    toast.success(t("product.addedToCart"));
  };

  return (
    <div className="shell py-6 lg:py-10">
      <Breadcrumb
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.catalog"), to: "/products" },
          ...(product.category
            ? [{ label: categoryName, to: `/products?category=${product.category.id}` }]
            : []),
          { label: name }
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* --------------------------------------------- A. Image gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-card bg-ceramic">
            {images[activeImage] ? (
              <img
                src={images[activeImage].image_url}
                alt={t("product.imageOf", { name })}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-text-faint">
                <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="1.6" />
                  <path d="m4 18 5-5 4 4 3-2.5 4 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`${t("product.imageOf", { name })} ${index + 1}`}
                  aria-current={index === activeImage}
                  className={cn(
                    "size-20 shrink-0 overflow-hidden rounded-[10px] border-2 transition-colors",
                    index === activeImage ? "border-action" : "border-transparent hover:border-hairline"
                  )}
                >
                  <img src={image.image_url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------ B. Product information */}
        <div>
          {categoryName && <Badge>{categoryName}</Badge>}

          <h1 className="mt-3 text-[24px] font-bold text-text lg:text-[32px]">{name}</h1>

          <p className="mt-3 text-[22px] font-bold text-text lg:text-[26px]">
            {formatVnd(product.price, i18n.language)}
          </p>

          {description && (
            <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-text-muted">
              {description}
            </p>
          )}

          {/* plan §1.3.B — surface low stock, e.g. "Còn 3 sản phẩm" */}
          {!outOfStock && product.inventory_quantity <= LOW_STOCK_THRESHOLD && (
            <p className="mt-4 text-[14px] font-semibold text-danger">
              {t("product.lowStock", { count: product.inventory_quantity })}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {!outOfStock && (
              <QuantityStepper
                value={quantity}
                max={product.inventory_quantity}
                onChange={setQuantity}
              />
            )}

            <Button
              size="lg"
              onClick={addToCart}
              disabled={outOfStock}
              className="max-sm:w-full sm:min-w-52"
            >
              {outOfStock ? t("product.outOfStock") : t("product.addToCart")}
            </Button>
          </div>

          <ul className="mt-8 space-y-3 border-t border-hairline pt-6">
            <ShippingNote
              icon={
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" strokeLinejoin="round" />
                  <circle cx="7" cy="18" r="1.6" />
                  <circle cx="17.5" cy="18" r="1.6" />
                </svg>
              }
            >
              {t("product.nationwide")}
            </ShippingNote>
            <ShippingNote
              icon={
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="2.5" y="6" width="19" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              }
            >
              {t("product.codAvailable")}
            </ShippingNote>
          </ul>
        </div>
      </div>

      {/* ------------------------------------------- C. Detailed description */}
      {description && (
        <section className="mt-12 rounded-card bg-surface p-6 shadow-card lg:p-8">
          <h2 className="text-[18px] font-semibold text-text">{t("product.description")}</h2>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text-muted">
            {description}
          </p>
        </section>
      )}

      {/* ------------------------------------------------ D. Related products */}
      {!!relatedQuery.data?.length && (
        <section className="mt-14">
          <h2 className="text-[20px] font-bold text-text lg:text-[24px]">{t("product.related")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {relatedQuery.data.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
