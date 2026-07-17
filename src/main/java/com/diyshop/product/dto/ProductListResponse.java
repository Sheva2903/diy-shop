package com.diyshop.product.dto;

import com.diyshop.category.dto.CategoryResponse;
import com.diyshop.product.Product;
import com.diyshop.product.ProductImage;

import java.math.BigDecimal;
import java.util.function.Function;

public record ProductListResponse(
        Long id,
        String nameVi,
        String nameEn,
        BigDecimal price,
        int inventoryQuantity,
        boolean inStock,
        CategoryResponse category,
        String primaryImageUrl
) {
    public static ProductListResponse from(Product product, Function<ProductImage, String> imageUrlResolver) {
        String primaryImageUrl = product.getImages().stream()
                .filter(image -> image.isPrimaryImage())
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(imageUrlResolver)
                .orElse(null);

        return new ProductListResponse(
                product.getId(),
                product.getNameVi(),
                product.getNameEn(),
                product.getPrice(),
                product.getInventoryQuantity(),
                product.getInventoryQuantity() > 0,
                CategoryResponse.from(product.getCategory()),
                primaryImageUrl
        );
    }
}
