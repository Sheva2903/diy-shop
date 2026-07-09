package com.diyshop.order.dto;

import com.diyshop.order.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productNameVi,
        String productNameEn,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProductNameVi(),
                item.getProductNameEn(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }
}
