package com.diyshop.category.dto;

import com.diyshop.category.Category;

public record SellerCategoryResponse(
        Long id,
        String nameVi,
        String nameEn,
        boolean visible
) {
    public static SellerCategoryResponse from(Category category) {
        return new SellerCategoryResponse(
                category.getId(),
                category.getNameVi(),
                category.getNameEn(),
                category.isVisible()
        );
    }
}
