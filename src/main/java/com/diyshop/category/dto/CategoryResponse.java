package com.diyshop.category.dto;

import com.diyshop.category.Category;

public record CategoryResponse(
        Long id,
        String nameVi,
        String nameEn
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getNameVi(),
                category.getNameEn()
        );
    }
}
