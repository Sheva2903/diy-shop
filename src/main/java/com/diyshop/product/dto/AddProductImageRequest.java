package com.diyshop.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record AddProductImageRequest(
        @NotBlank @Size(max = 500) String imageUrl,

        Boolean primaryImage,

        @PositiveOrZero Integer sortOrder) {
}
