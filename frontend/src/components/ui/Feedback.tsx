import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/** plan §3.1 — grey animated bars, never a full-page spinner for partial loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-black/8", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** plan §3.2 — icon + title + short description + CTA. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card bg-surface px-6 py-14 text-center",
        className
      )}
    >
      {icon && <div className="text-text-faint">{icon}</div>}
      <h3 className="text-[18px] font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-[15px] text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-surface px-6 py-14 text-center">
      <svg viewBox="0 0 24 24" className="size-9 text-danger" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16h.01" strokeLinecap="round" />
      </svg>
      <h3 className="text-[18px] font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-[15px] text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
