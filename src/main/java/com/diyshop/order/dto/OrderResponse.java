package com.diyshop.order.dto;

import com.diyshop.order.CustomerOrder;
import com.diyshop.order.OrderStatus;
import com.diyshop.order.PaymentMethod;
import com.diyshop.order.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String orderCode,
        String recipientFullName,
        String phoneNumber,
        String email,
        String provinceCity,
        String district,
        String ward,
        String streetAddress,
        String customerNote,
        PaymentMethod paymentMethod,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        BankTransferInstructionsResponse bankTransfer,
        List<OrderItemResponse> items,
        Instant createdAt
) {
    public static OrderResponse from(
            CustomerOrder order,
            BankTransferInstructionsResponse bankTransfer
    ) {
        return new OrderResponse(
                order.getOrderCode(),
                order.getRecipientFullName(),
                order.getPhoneNumber(),
                order.getEmail(),
                order.getProvinceCity(),
                order.getDistrict(),
                order.getWard(),
                order.getStreetAddress(),
                order.getCustomerNote(),
                order.getPaymentMethod(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotalAmount(),
                bankTransfer,
                order.getItems().stream()
                        .map(OrderItemResponse::from)
                        .toList(),
                order.getCreatedAt()
        );
    }
}
