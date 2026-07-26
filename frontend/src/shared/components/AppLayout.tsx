import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";

import { useCart } from "../../features/cart/hooks/useCart";
import { contactInfo } from "../config/contact";

import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const { totalQuantity } = useCart();

  return (
    <div className={styles.pageShell}>
      <header className={styles.header}>
        <div className={styles.navigation}>
          <Link className={styles.brand} to="/" aria-label="DIY Shop">
            <span className={styles.brandMark}>DIY</span>
            <span>Shop</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link className={styles.navLink} to="/">
              {t("navigation.shop")}
            </Link>
            <Link className={styles.navLink} to="/track">
              {t("navigation.trackOrder")}
            </Link>
          </nav>
          <div className={styles.actions}>
            <Link className={styles.cartLink} to="/cart" aria-label={t("cart.title")}>
              <span aria-hidden="true">🛒</span>
              {totalQuantity > 0 ? <span className={styles.cartBadge}>{totalQuantity}</span> : null}
            </Link>
            <div className={styles.languageSwitch} aria-label="Language">
              <button
                type="button"
                className={language === "vi" ? styles.languageActive : styles.languageButton}
                aria-pressed={language === "vi"}
                onClick={() => i18n.changeLanguage("vi")}
              >
                {t("language.vi")}
              </button>
              <button
                type="button"
                className={language === "en" ? styles.languageActive : styles.languageButton}
                aria-pressed={language === "en"}
                onClick={() => i18n.changeLanguage("en")}
              >
                {t("language.en")}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <section className={styles.footerSection}>
            <h2>{t("footer.contact")}</h2>
            <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>{contactInfo.phone}</a>
          </section>
          <section className={styles.footerSection}>
            <h2>{t("footer.followUs")}</h2>
            <div className={styles.socialLinks}>
              <a href={contactInfo.zalo} target="_blank" rel="noreferrer">
                Zalo
              </a>
              <a href={contactInfo.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href={contactInfo.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </section>
          <p className={styles.copyright}>© 2026 DIY Shop. {t("footer.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  );
}
