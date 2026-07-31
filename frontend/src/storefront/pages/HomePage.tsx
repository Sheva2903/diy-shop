import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getCategories, getProducts } from "../../api/catalog";
import { getShopSettings } from "../../api/settings";
import { ButtonLink } from "../../components/ui/Button";
import { ProductCardSkeleton } from "../../components/ui/Feedback";
import { localizeName } from "../../lib/localize";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const { t, i18n } = useTranslation();

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const settingsQuery = useQuery({ queryKey: ["shop-settings"], queryFn: getShopSettings });
  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getProducts({ limit: 8 })
  });

  // plan §1.1.B / §1.1.E — real product photography from the API, no stock art.
  const heroImage = featuredQuery.data?.find((product) => product.primaryImageUrl)?.primaryImageUrl;
  const inspirationImage = featuredQuery.data?.filter((product) => product.primaryImageUrl)[1]
    ?.primaryImageUrl;

  const shopDescription =
    i18n.language === "en"
      ? settingsQuery.data?.description_en || t("home.heroSubtitle")
      : settingsQuery.data?.description_vi || t("home.heroSubtitle");

  return (
    <>
      {/* ------------------------------------------------------- B. Hero */}
      <section className="relative isolate overflow-hidden bg-forest">
        {heroImage && (
          <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        )}
        {/* plan §1.1.B — rgba(30,57,50,0.45) overlay keeps the headline readable */}
        <div className="absolute inset-0 bg-[rgba(30,57,50,0.72)] sm:bg-[linear-gradient(90deg,rgba(30,57,50,0.92)_0%,rgba(30,57,50,0.72)_55%,rgba(30,57,50,0.45)_100%)]" />

        <div className="shell relative py-20 lg:py-28">
          <div className="max-w-xl">
            <h1 className="text-[28px] font-extrabold text-white sm:text-[40px] lg:text-[48px]">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 text-[16px] text-white/85 lg:text-[18px]">{shopDescription}</p>
            <ButtonLink to="/products" size="lg" className="mt-8">
              {t("home.heroCta")}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- C. Category shelf */}
      <section className="section shell">
        <h2 className="text-[20px] font-bold text-text lg:text-[24px]">{t("home.categoriesTitle")}</h2>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categoriesQuery.isPending
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-card bg-black/8" />
              ))
            : categoriesQuery.data?.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="flex h-28 items-center justify-center rounded-card bg-surface px-4 text-center shadow-card transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-card-hover"
                >
                  <span className="text-[16px] font-semibold text-text">
                    {localizeName(
                      { nameVi: category.name_vi, nameEn: category.name_en },
                      i18n.language
                    )}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* ----------------------------------------- D. Featured products */}
      <section className="shell pb-10 lg:pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[20px] font-bold text-text lg:text-[24px]">{t("home.featuredTitle")}</h2>
          <Link to="/products" className="text-[15px] font-semibold text-action hover:underline">
            {t("home.viewAll")}
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {featuredQuery.isPending
            ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : featuredQuery.data
                ?.slice(0, 8)
                .map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* ------------------------------------- E. Inspiration / feature */}
      <section className="bg-forest">
        <div className="shell flex flex-col items-center gap-10 py-16 lg:flex-row lg:justify-between lg:py-20">
          <div className="max-w-lg text-center lg:text-left">
            <h2 className="text-[24px] font-bold text-white lg:text-[32px]">
              {t("home.inspirationTitle")}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/80">{t("home.inspirationBody")}</p>
            <ButtonLink to="/products" variant="onDark" size="lg" className="mt-8">
              {t("home.inspirationCta")}
            </ButtonLink>
          </div>

          {inspirationImage && (
            <img
              src={inspirationImage}
              alt=""
              aria-hidden="true"
              className="size-56 shrink-0 rounded-full object-cover lg:size-72"
            />
          )}
        </div>
      </section>
    </>
  );
}
