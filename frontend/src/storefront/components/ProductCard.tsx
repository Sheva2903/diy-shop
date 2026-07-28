import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { ProductSummary } from "../../api/catalog";
import { useToast } from "../../components/ui/toast";
import { useCart } from "../../features/cart/CartProvider";
import { cn } from "../../lib/cn";
import { formatVnd } from "../../lib/format";
import { localizeName } from "../../lib/localize";

export function ProductCard({ product }: { product: ProductSummary }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const toast = useToast();

  const name = localizeName({ nameVi: product.name_vi, nameEn: product.name_en }, i18n.language);
  const categoryName = product.category
    ? localizeName(
        { nameVi: product.category.name_vi, nameEn: product.category.name_en },
        i18n.language
      )
    : "";
  const outOfStock = product.inventory_quantity <= 0;

  const quickAdd = () => {
    addItem({
      productId: product.id,
      nameVi: product.name_vi,
      nameEn: product.name_en,
      price: product.price,
      primaryImageUrl: product.primaryImageUrl,
      quantity: 1,
      inventoryQuantity: product.inventory_quantity
    });
    toast.success(t("product.addedToCart"));
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-surface shadow-card transition-[box-shadow,transform] duration-200",
        outOfStock ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-card-hover"
      )}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ceramic">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={t("product.imageOf", { name })}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-text-faint">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m4 18 5-5 4 4 3-2.5 4 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {outOfStock && (
            <span className="absolute top-3 left-3 rounded-pill bg-black/70 px-3 py-1 text-[12px] font-semibold text-white">
              {t("product.outOfStock")}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4 pb-14">
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-[16px] font-semibold text-text">{name}</h3>
        </Link>
        {categoryName && <p className="truncate text-[13px] text-text-muted">{categoryName}</p>}
        <p className="mt-auto pt-1 text-[17px] font-bold text-text">
          {formatVnd(product.price, i18n.language)}
        </p>
      </div>

      {/* plan §1.1.D — round quick-add button, bottom right of the card */}
      {!outOfStock && (
        <button
          type="button"
          onClick={quickAdd}
          aria-label={`${t("product.addToCart")}: ${name}`}
          className="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center rounded-full bg-action text-white shadow-card transition-transform duration-[120ms] hover:bg-action-strong active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
    </article>
  );
}
