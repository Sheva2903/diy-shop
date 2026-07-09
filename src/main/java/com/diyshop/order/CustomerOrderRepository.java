package com.diyshop.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    boolean existsByOrderCode(String orderCode);

    @Query("""
            select o
            from CustomerOrder o
            order by
                case
                    when o.orderStatus = com.diyshop.order.OrderStatus.PENDING then 0
                    when o.orderStatus = com.diyshop.order.OrderStatus.CONFIRMED then 1
                    when o.orderStatus = com.diyshop.order.OrderStatus.SHIPPING then 2
                    else 3
                end,
                o.createdAt desc
            """)
    List<CustomerOrder> findAllForSellerOrderByActiveFirst();

    @Query("""
            select distinct o
            from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            where o.orderCode = :orderCode
            """)
    Optional<CustomerOrder> findByOrderCodeWithItems(@Param("orderCode") String orderCode);

    @Query("""
            select distinct o
            from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            where o.orderCode = :orderCode
              and o.phoneNumber = :phoneNumber
            """)
    Optional<CustomerOrder> findByOrderCodeAndPhoneNumberWithItems(
            @Param("orderCode") String orderCode,
            @Param("phoneNumber") String phoneNumber
    );
}
