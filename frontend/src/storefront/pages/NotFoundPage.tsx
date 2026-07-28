import { useTranslation } from "react-i18next";

import { ButtonLink } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="section shell">
      <EmptyState
        title={t("state.notFoundTitle")}
        description={t("state.notFoundDescription")}
        action={<ButtonLink to="/">{t("state.backHome")}</ButtonLink>}
      />
    </div>
  );
}
