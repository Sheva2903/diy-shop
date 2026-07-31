import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/** Titled card used to group dashboard form fields. */
export function Section({
  title,
  description,
  aside,
  children,
  className
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card bg-surface shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-5 py-4 lg:px-6">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-text-muted">{description}</p>}
        </div>
        {aside}
      </header>

      <div className="px-5 py-5 lg:px-6">{children}</div>
    </section>
  );
}
