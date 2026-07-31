import { useTranslation } from "react-i18next";

import { formatDateTime, formatVnd } from "../../lib/format";
import type { BankTransferInstructions } from "../../types/database";

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-[14px] text-text-muted">{label}</dt>
      <dd className={`text-right text-[14px] font-semibold text-text ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

/** plan §1.5 / §1.6 / §1.7 — bank details + VietQR, shown wherever payment is pending. */
export function BankTransferPanel({ instructions }: { instructions: BankTransferInstructions }) {
  const { t, i18n } = useTranslation();

  return (
    <section className="rounded-card bg-surface p-5 shadow-card lg:p-6">
      <h2 className="text-[18px] font-semibold text-text">{t("bank.title")}</h2>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        <img
          src={instructions.qrImageUrl}
          alt={t("bank.qrAlt")}
          className="w-full max-w-[260px] self-center rounded-card border border-hairline bg-white sm:self-start"
        />

        <dl className="flex-1 divide-y divide-hairline">
          <Row label={t("bank.bankName")} value={instructions.bankName} />
          <Row label={t("bank.accountNumber")} value={instructions.accountNumber} mono />
          <Row label={t("bank.accountName")} value={instructions.accountName} />
          <Row label={t("bank.amount")} value={formatVnd(instructions.amount, i18n.language)} />
          <Row label={t("bank.content")} value={instructions.transferContent} mono />
          <Row
            label={t("bank.dueAt")}
            value={formatDateTime(instructions.paymentDueAt, i18n.language)}
          />
        </dl>
      </div>

      <p className="mt-4 rounded-lg bg-mint/40 px-4 py-3 text-[13px] text-forest">
        {t("checkout.bankInstructions", { content: instructions.transferContent })}
      </p>
    </section>
  );
}
