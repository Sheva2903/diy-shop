import { Fragment } from "react";
import { Link } from "react-router-dom";

export type Crumb = { label: string; to?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-text-muted">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <li aria-hidden="true">›</li>}
            <li>
              {item.to ? (
                <Link to={item.to} className="hover:text-action hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-text">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
