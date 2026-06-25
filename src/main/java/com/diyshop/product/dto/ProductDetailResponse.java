package com.diyshop.product.dto;

import com.diyshop.category.dto.CategoryResponse;
import com.diyshop.product.Product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        Long id,
        String nameVi,
        String nameEn,
        String descriptionVi,
        String descriptionEn,
        BigDecimal price,
        int inventoryQuantity,
        boolean inStock,
        CategoryResponse category,
        List<ProductImageResponse> images
) {
    public static ProductDetailResponse from(Product product) {
        return new ProductDetailResponse(
                product.getId(),
                product.getNameVi(),
                product.getNameEn(),
                product.getDescriptionVi(),
                product.getDescriptionEn(),
                product.getPrice(),
                product.getInventoryQuantity(),
                product.getInventoryQuantity() > 0,
                CategoryResponse.from(product.getCategory()),
                product.getImages().stream()
                        .map(ProductImageResponse::from)
                        .toList()
        );
    }
}
