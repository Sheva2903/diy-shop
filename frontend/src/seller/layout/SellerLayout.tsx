import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { sellerLogout } from "../../api/auth";
import { cn } from "../../lib/cn";
import { useSellerSession } from "../auth/useSellerSession";

type NavItem = { to: string; label: string; icon: React.ReactNode; end?: boolean };

const icon = (path: React.ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

const navItems: NavItem[] = [
  { to: "/seller", end: true, label: "Overview", icon: icon(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>) },
  { to: "/seller/products", label: "Products", icon: icon(<><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></>) },
  { to: "/seller/categories", label: "Categories", icon: icon(<><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h9A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z" /></>) },
  { to: "/seller/orders", label: "Orders", icon: icon(<><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 8H6" /><circle cx="10" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></>) },
  { to: "/seller/settings", label: "Settings", icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.3 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.6a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z" /></>) }
];

const pageTitles: Record<string, string> = {
  "/seller": "Overview",
  "/seller/products": "Products",
  "/seller/products/new": "Add product",
  "/seller/categories": "Categories",
  "/seller/orders": "Orders",
  "/seller/settings": "Settings"
};

function currentTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/seller/orders/")) return "Order detail";
  if (pathname.startsWith("/seller/products/")) return "Edit product";
  return "Dashboard";
}

export function SellerLayout() {
  const { username, refresh } = useSellerSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = async () => {
    await sellerLogout();
    await refresh();
    navigate("/seller/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-colors duration-[120ms]",
      isActive ? "bg-mint text-forest" : "text-white/75 hover:bg-forest-soft hover:text-white"
    );

  const sidebar = (
    <>
      <div className="flex items-center gap-2 px-3 py-5 text-white">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="currentColor">
          <path d="M12 2.2c-2.1 3-4.4 4.6-6.5 6.6A8.6 8.6 0 0 0 12 22a8.6 8.6 0 0 0 6.5-13.2C16.4 6.8 14.1 5.2 12 2.2Zm0 4.4c1.2 1.6 2.5 2.7 3.7 3.9A5.6 5.6 0 0 1 12 19a5.6 5.6 0 0 1-3.7-8.5c1.2-1.2 2.5-2.3 3.7-3.9Z" />
        </svg>
        <span className="text-[16px] font-extrabold tracking-tight">DIY Shop</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setMenuOpen(false)}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => void signOut()}
        className="mx-3 mb-4 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-white/75 transition-colors hover:bg-forest-soft hover:text-white"
      >
        {icon(<><path d="M15 17v1.5A1.5 1.5 0 0 1 13.5 20h-7A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V7" /><path d="M18.5 12H10m8.5 0-2.5-2.5M18.5 12 16 14.5" /></>)}
        Sign out
      </button>
    </>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      {/* plan §2.1 — 240px fixed forest sidebar on desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-forest lg:flex">{sidebar}</aside>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-forest lg:hidden">{sidebar}</aside>
        </>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-surface px-4 lg:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-full text-text hover:bg-ceramic lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <h1 className="text-[18px] font-bold text-text lg:text-[22px]">
            {currentTitle(location.pathname)}
          </h1>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-[14px] text-text-muted sm:block">{username}</span>
            <span className="flex size-9 items-center justify-center rounded-full bg-mint text-[14px] font-bold text-forest">
              {username?.[0]?.toUpperCase() ?? "S"}
            </span>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
