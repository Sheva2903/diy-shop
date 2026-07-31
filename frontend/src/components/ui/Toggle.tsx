import { useId } from "react";

import { cn } from "../../lib/cn";

/** Switch-style boolean control for settings rows in the dashboard. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4 rounded-[10px] border border-hairline bg-canvas px-4 py-3">
      <span className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-[14px] font-semibold text-text">
          {label}
        </label>
        {description && <span className="block text-[13px] text-text-muted">{description}</span>}
      </span>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors duration-[120ms]",
          checked ? "bg-action" : "bg-black/20",
          disabled && "pointer-events-none opacity-45"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-[120ms]",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
