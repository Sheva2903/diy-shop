package com.diyshop.category.dto;

import com.diyshop.category.Category;

public record SellerCategoryResponse(
        Long id,
        String nameVi,
        String nameEn,
        boolean visible,
        long productCount
) {
    public static SellerCategoryResponse from(Category category, long productCount) {
        return new SellerCategoryResponse(
                category.getId(),
                category.getNameVi(),
                category.getNameEn(),
                category.isVisible(),
                productCount
        );
    }
}
