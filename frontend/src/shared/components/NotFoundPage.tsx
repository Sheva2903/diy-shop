import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className={styles.page}>
      <h1>{t("state.notFoundTitle")}</h1>
      <p>{t("state.notFoundDescription")}</p>
      <Link className={styles.returnLink} to="/">
        {t("state.returnToShop")}
      </Link>
    </section>
  );
}
