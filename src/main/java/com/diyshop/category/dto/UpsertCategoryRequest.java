package com.diyshop.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertCategoryRequest(
        @NotBlank @Size(max = 100) String nameVi,
        @NotBlank @Size(max = 100) String nameEn
) {
}
