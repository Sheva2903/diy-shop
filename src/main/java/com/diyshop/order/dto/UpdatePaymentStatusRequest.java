package com.diyshop.order.dto;

import com.diyshop.order.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePaymentStatusRequest(
        @NotNull PaymentStatus paymentStatus
) {
}
