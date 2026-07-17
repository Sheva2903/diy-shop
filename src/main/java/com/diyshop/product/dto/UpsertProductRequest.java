package com.diyshop.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpsertProductRequest(
        @NotBlank @Size(max = 200) String nameVi,
        @NotBlank @Size(max = 200) String nameEn,
        @NotBlank @Size(max = 20_000) String descriptionVi,
        @NotBlank @Size(max = 20_000) String descriptionEn,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @NotNull @PositiveOrZero Integer inventoryQuantity,
        @NotNull Long categoryId,
        @NotNull Boolean visible
) {
}
