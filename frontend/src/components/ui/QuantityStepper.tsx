import { useTranslation } from "react-i18next";

import { cn } from "../../lib/cn";

/** plan §1.3.B — minus | number | plus */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md"
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  const buttonSize = size === "sm" ? "size-9" : "size-11";

  const clamp = (next: number) => Math.min(Math.max(next, min), Math.max(max, min));

  return (
    <div className="inline-flex items-center rounded-pill border border-hairline bg-surface">
      <button
        type="button"
        aria-label={t("product.decrease")}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(
          buttonSize,
          "inline-flex items-center justify-center rounded-full text-text transition-colors hover:bg-ceramic disabled:opacity-35 disabled:hover:bg-transparent"
        )}
      >
        <svg viewBox="0 0 24 24" className="size-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>

      <input
        type="number"
        inputMode="numeric"
        aria-label={t("product.quantity")}
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        className={cn(
          "w-11 border-0 bg-transparent text-center text-[15px] font-semibold text-text outline-none",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
      />

      <button
        type="button"
        aria-label={t("product.increase")}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(
          buttonSize,
          "inline-flex items-center justify-center rounded-full text-text transition-colors hover:bg-ceramic disabled:opacity-35 disabled:hover:bg-transparent"
        )}
      >
        <svg viewBox="0 0 24 24" className="size-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
