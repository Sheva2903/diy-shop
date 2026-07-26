import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../../../shared/api/client";
import { getOrders } from "../api/sellerOrderApi";
import { getProducts } from "../api/sellerProductApi";
import type { SellerOrderListItem, SellerProduct } from "../types";

import styles from "../styles/seller.module.css";
import dashboardStyles from "./SellerDashboardPage.module.css";

const lowStockThreshold = 5;

export function SellerDashboardPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([getProducts(controller.signal), getOrders(controller.signal)])
      .then(([productsData, ordersData]) => {
        setProducts(productsData);
        setOrders(ordersData);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof ApiError ? caught.message : "Could not load dashboard data.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const lowStock = products.filter(
    (product) => product.visible && product.inventoryQuantity > 0 && product.inventoryQuantity <= lowStockThreshold
  ).length;
  const activeOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "SHIPPING"].includes(order.orderStatus)
  ).length;
  const unpaidTransfers = orders.filter(
    (order) => order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "UNPAID"
  ).length;
  const hiddenProducts = products.filter((product) => !product.visible).length;
  const totalInventory = products.reduce((total, product) => total + product.inventoryQuantity, 0);

  if (isLoading) {
    return <p className={styles.empty}>Loading...</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.subtitle}>Today's operational summary</p>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={dashboardStyles.statsGrid}>
        <Link className={dashboardStyles.statCard} to="/seller/products">
          <h2>Total products</h2>
          <p className={dashboardStyles.statValue}>{products.length}</p>
          <p className={dashboardStyles.statNote}>{hiddenProducts} hidden</p>
        </Link>

        <Link className={dashboardStyles.statCard} to="/seller/products">
          <h2>Low stock</h2>
          <p
            className={
              lowStock > 0
                ? `${dashboardStyles.statValue} ${dashboardStyles.statWarning}`
                : dashboardStyles.statValue
            }
          >
            {lowStock}
          </p>
          <p className={dashboardStyles.statNote}>{lowStockThreshold} units or fewer</p>
        </Link>

        <Link className={dashboardStyles.statCard} to="/seller/orders">
          <h2>Active orders</h2>
          <p className={dashboardStyles.statValue}>{activeOrders}</p>
          <p className={dashboardStyles.statNote}>Pending, confirmed or shipping</p>
        </Link>

        <Link className={dashboardStyles.statCard} to="/seller/orders">
          <h2>Bank transfers to confirm</h2>
          <p
            className={
              unpaidTransfers > 0
                ? `${dashboardStyles.statValue} ${dashboardStyles.statWarning}`
                : dashboardStyles.statValue
            }
          >
            {unpaidTransfers}
          </p>
          <p className={dashboardStyles.statNote}>Awaiting payment confirmation</p>
        </Link>
      </div>

      <section className={styles.card}>
        <h2>Quick stats</h2>
        <ul className={dashboardStyles.statsList}>
          <li>
            <span>Visible products</span>
            <strong>{products.filter((product) => product.visible).length}</strong>
          </li>
          <li>
            <span>Total inventory</span>
            <strong>{totalInventory} units</strong>
          </li>
          <li>
            <span>Delivered orders</span>
            <strong>{orders.filter((order) => order.orderStatus === "DELIVERED").length}</strong>
          </li>
          <li>
            <span>Cash on delivery orders</span>
            <strong>{orders.filter((order) => order.paymentMethod === "COD").length}</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
