package com.diyshop.order.dto;

import com.diyshop.order.CustomerOrder;
import com.diyshop.order.OrderStatus;
import com.diyshop.order.PaymentMethod;
import com.diyshop.order.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record SellerOrderListResponse(
        String orderCode,
        String recipientFullName,
        String phoneNumber,
        PaymentMethod paymentMethod,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        Instant createdAt
) {
    public static SellerOrderListResponse from(CustomerOrder order) {
        return new SellerOrderListResponse(
                order.getOrderCode(),
                order.getRecipientFullName(),
                order.getPhoneNumber(),
                order.getPaymentMethod(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getTotalAmount(),
                order.getCreatedAt()
        );
    }
}
