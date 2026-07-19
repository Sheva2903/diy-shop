import { useTranslation } from "react-i18next";

import styles from "./ContentState.module.css";

export function LoadingState() {
  const { t } = useTranslation();

  return <p className={styles.loading}>{t("state.loading")}</p>;
}

type ErrorStateProps = {
  onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.stateCard} aria-live="polite">
      <h2>{t("state.errorTitle")}</h2>
      <p>{t("state.errorDescription")}</p>
      <button className={styles.primaryButton} type="button" onClick={onRetry}>
        {t("state.retry")}
      </button>
    </section>
  );
}
