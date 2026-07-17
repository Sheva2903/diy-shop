package com.diyshop.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateInventoryRequest(@NotNull @PositiveOrZero Integer inventoryQuantity) {
}
