package com.diyshop.order.dto;

import com.diyshop.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus orderStatus
) {
}
