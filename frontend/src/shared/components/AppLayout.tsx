import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";

import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

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
          </nav>
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
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
