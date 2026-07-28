import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { getCategories } from "../../api/catalog";
import { getShopSettings } from "../../api/settings";
import { IconButton } from "../../components/ui/Button";
import { useCart } from "../../features/cart/CartProvider";
import { cn } from "../../lib/cn";
import { localizeName } from "../../lib/localize";

function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 font-extrabold tracking-tight", onDark ? "text-white" : "text-brand")}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="currentColor">
        <path d="M12 2.2c-2.1 3-4.4 4.6-6.5 6.6A8.6 8.6 0 0 0 12 22a8.6 8.6 0 0 0 6.5-13.2C16.4 6.8 14.1 5.2 12 2.2Zm0 4.4c1.2 1.6 2.5 2.7 3.7 3.9A5.6 5.6 0 0 1 12 19a5.6 5.6 0 0 1-3.7-8.5c1.2-1.2 2.5-2.3 3.7-3.9Z" />
      </svg>
      <span className="text-[17px]">DIY Shop</span>
    </span>
  );
}

function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { i18n } = useTranslation();

  return (
    <div
      className={cn(
        "flex items-center rounded-pill p-0.5 text-[13px] font-semibold",
        onDark ? "bg-white/15" : "bg-ceramic"
      )}
    >
      {(["vi", "en"] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => void i18n.changeLanguage(language)}
          aria-pressed={i18n.language === language}
          className={cn(
            "rounded-pill px-2.5 py-1 uppercase transition-colors duration-[120ms]",
            i18n.language === language
              ? onDark
                ? "bg-white text-forest"
                : "bg-surface text-action shadow-sm"
              : onDark
                ? "text-white/70"
                : "text-text-muted"
          )}
        >
          {language}
        </button>
      ))}
    </div>
  );
}

function CartButton() {
  const { totalQuantity } = useCart();
  const { t } = useTranslation();

  return (
    <Link
      to="/cart"
      aria-label={`${t("nav.cart")}${totalQuantity ? ` (${totalQuantity})` : ""}`}
      className="relative inline-flex size-11 items-center justify-center rounded-full text-text transition-colors duration-[120ms] hover:bg-ceramic"
    >
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {totalQuantity > 0 && (
        <span className="absolute top-1 right-1 min-w-5 rounded-pill bg-action px-1.5 text-center text-[11px] font-bold text-white">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </Link>
  );
}

export function StoreLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: settings } = useQuery({ queryKey: ["shop-settings"], queryFn: getShopSettings });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrolling the window is an external side effect; the menu closes from the
  // link handlers below so no state is set during this effect.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-[15px] font-medium transition-colors duration-[120ms] hover:text-action",
      isActive ? "text-action" : "text-text"
    );

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={cn(
          "sticky top-0 z-40 bg-surface transition-shadow duration-200",
          scrolled ? "shadow-navigation" : "border-b border-hairline"
        )}
      >
        <div className="shell flex h-16 items-center gap-4">
          <IconButton
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.menu")}
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </IconButton>

          <Link to="/" className="lg:mr-2">
            <Logo />
          </Link>

          <nav className="hidden flex-1 items-center gap-6 lg:flex">
            <NavLink to="/products" className={navLinkClass} end>
              {t("nav.catalog")}
            </NavLink>
            {categories?.map((category) => (
              <NavLink key={category.id} to={`/products?category=${category.id}`} className={navLinkClass}>
                {localizeName(
                  { nameVi: category.name_vi, nameEn: category.name_en },
                  i18n.language
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 lg:gap-3">
            <NavLink to="/track" className="hidden text-[15px] font-medium text-text hover:text-action sm:block">
              {t("nav.trackOrder")}
            </NavLink>
            <LanguageToggle />
            <CartButton />
          </div>
        </div>

        {menuOpen && (
          <nav className="shell flex flex-col gap-1 border-t border-hairline py-3 lg:hidden">
            <NavLink
              to="/products"
              end
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-ceramic"
            >
              {t("nav.catalog")}
            </NavLink>
            {categories?.map((category) => (
              <NavLink
                key={category.id}
                to={`/products?category=${category.id}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-ceramic"
              >
                {localizeName({ nameVi: category.name_vi, nameEn: category.name_en }, i18n.language)}
              </NavLink>
            ))}
            <NavLink
              to="/track"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-ceramic"
            >
              {t("nav.trackOrder")}
            </NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* plan §1.1.F — simple footer: logo + copyright left, two link columns right */}
      <footer className="border-t border-hairline bg-canvas">
        <div className="shell flex flex-col gap-8 py-10 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <Logo />
            <p className="text-[13px] text-text-muted">
              © {new Date().getFullYear()} {settings?.shop_name ?? "DIY Shop"}. {t("footer.rights")}
            </p>
            {settings?.contact_phone && (
              <p className="text-[13px] text-text-muted">{settings.contact_phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[14px]">
            <Link to="/products" className="text-text-muted hover:text-action">
              {t("footer.about")}
            </Link>
            <Link to="/track" className="text-text-muted hover:text-action">
              {t("footer.shipping")}
            </Link>
            <Link to="/products" className="text-text-muted hover:text-action">
              {t("footer.returns")}
            </Link>
            <Link to="/products" className="text-text-muted hover:text-action">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
