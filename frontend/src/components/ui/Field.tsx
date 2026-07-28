import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

// plan §0.3 — label always sits above the control, never placeholder-only.
const controlBase =
  "w-full rounded-[10px] border border-hairline bg-surface px-3.5 text-[15px] text-text " +
  "transition-colors duration-[120ms] placeholder:text-text-faint " +
  "focus:outline-none focus:border-action focus:ring-2 focus:ring-action " +
  "disabled:bg-ceramic disabled:text-text-muted";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function FieldShell({ id, label, hint, error, required, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>

      {children}

      {error ? (
        // plan §3.3 — inline error: warning icon + danger text
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-[13px] text-danger">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true" fill="currentColor">
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.25a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0V6.5A.75.75 0 0 0 8 5.75Zm0 6.5a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * `className` styles the field wrapper — that is where layout belongs (grid
 * spans, max widths). Use `inputClassName` to reach the control itself.
 */
type BaseFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export function TextField({
  label,
  hint,
  error,
  className,
  inputClassName,
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & BaseFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={className}
    >
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          controlBase,
          "h-11",
          error && "border-danger focus:border-danger focus:ring-danger",
          inputClassName
        )}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  inputClassName,
  id,
  rows = 4,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & BaseFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={className}
    >
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          controlBase,
          "resize-y py-2.5 leading-6",
          error && "border-danger focus:border-danger focus:ring-danger",
          inputClassName
        )}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  inputClassName,
  id,
  children,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & BaseFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={className}
    >
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          controlBase,
          "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10",
          error && "border-danger",
          inputClassName
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23666'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")"
        }}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
