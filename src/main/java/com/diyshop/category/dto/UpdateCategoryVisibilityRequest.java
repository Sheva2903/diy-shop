package com.diyshop.category.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCategoryVisibilityRequest(@NotNull Boolean visible) {
}
