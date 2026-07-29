package com.diyshop.dashboard;

import com.diyshop.order.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Read-only projections for the seller dashboard. Kept apart from the order and
 * product repositories because nothing else needs these aggregates.
 */
public interface DashboardRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            select count(o)
            from CustomerOrder o
            where o.createdAt >= :from
              and o.createdAt < :to
            """)
    long countOrdersCreatedBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from CustomerOrder o
            where o.orderStatus <> com.diyshop.order.OrderStatus.CANCELLED
              and o.createdAt >= :from
              and o.createdAt < :to
            """)
    BigDecimal sumRevenueBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("select count(p) from Product p where p.visible = true")
    long countActiveProducts();

    @Query("""
            select count(o)
            from CustomerOrder o
            where o.orderStatus in (
                com.diyshop.order.OrderStatus.PENDING,
                com.diyshop.order.OrderStatus.CONFIRMED
            )
            """)
    long countPendingOrders();

    @Query("""
            select distinct p
            from Product p
            left join fetch p.images
            where p.visible = true
              and p.inventoryQuantity <= :threshold
            order by p.inventoryQuantity, p.id
            """)
    List<com.diyshop.product.Product> findLowStockProducts(
            @Param("threshold") int threshold,
            Pageable pageable
    );

    /**
     * One row per (day, category) with its revenue. Days with no orders are absent;
     * the caller fills the gaps so the chart axis stays continuous.
     */
    @Query("""
            select function('date', i.order.createdAt) as day,
                   c.id as categoryId,
                   c.nameVi as nameVi,
                   c.nameEn as nameEn,
                   sum(i.lineTotal) as revenue
            from OrderItem i
            join i.order o
            join i.product p
            join p.category c
            where o.orderStatus <> com.diyshop.order.OrderStatus.CANCELLED
              and o.createdAt >= :from
            group by function('date', i.order.createdAt), c.id, c.nameVi, c.nameEn
            order by function('date', i.order.createdAt), c.id
            """)
    List<Object[]> findCategoryRevenueSince(@Param("from") Instant from);
}
