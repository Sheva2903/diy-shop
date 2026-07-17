package com.diyshop.product.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateProductVisibilityRequest(@NotNull Boolean visible) {
}
