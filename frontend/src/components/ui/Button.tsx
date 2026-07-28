import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

// plan §0.3 — pill shape, 120ms transition, scale(0.95) on press
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold " +
  "transition-[background-color,color,border-color,transform] duration-[120ms] " +
  "active:scale-95 disabled:pointer-events-none disabled:opacity-45 " +
  "select-none whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-action text-white hover:bg-action-strong",
  secondary: "border border-action text-action bg-transparent hover:bg-mint/50",
  ghost: "bg-ceramic text-text hover:bg-hairline",
  danger: "bg-danger text-white hover:brightness-90",
  onDark: "border border-white/70 text-white bg-transparent hover:bg-white/10"
};

// plan §3.6 — 44px minimum touch target
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-8 text-[15px]"
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & CommonProps
>(function Button({ variant = "primary", size = "md", fullWidth, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: LinkProps & CommonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

/** Icon-only button. Callers must pass an aria-label (plan §3.6). */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string; tone?: "default" | "danger" }
>(function IconButton({ className, tone = "default", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-colors duration-[120ms] active:scale-95",
        tone === "danger"
          ? "text-danger hover:bg-danger-soft"
          : "text-text-muted hover:bg-ceramic hover:text-text",
        "disabled:pointer-events-none disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
});
