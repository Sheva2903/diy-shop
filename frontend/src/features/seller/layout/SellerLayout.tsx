import { Link, Outlet, useLocation } from "react-router-dom";
import { useSellerSession } from "../auth/useSellerSession";
import styles from "./SellerLayout.module.css";

export function SellerLayout() {
  const { username, logout } = useSellerSession();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.branding}>
          <h1>DIY Shop</h1>
          <p>Seller Dashboard</p>
        </div>

        <nav className={styles.nav}>
          <Link
            to="/seller/dashboard"
            className={isActive("/seller/dashboard") ? styles.active : ""}
          >
            Dashboard
          </Link>
          <Link
            to="/seller/products"
            className={isActive("/seller/products") ? styles.active : ""}
          >
            Products
          </Link>
          <Link
            to="/seller/categories"
            className={isActive("/seller/categories") ? styles.active : ""}
          >
            Categories
          </Link>
          <Link
            to="/seller/orders"
            className={isActive("/seller/orders") ? styles.active : ""}
          >
            Orders
          </Link>
        </nav>

        <div className={styles.userSection}>
          <p className={styles.username}>{username}</p>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
