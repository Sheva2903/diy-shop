package com.diyshop.product.dto;

import com.diyshop.category.dto.SellerCategoryResponse;
import com.diyshop.product.Product;
import com.diyshop.product.ProductImage;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Function;

public record SellerProductResponse(
        Long id,
        String nameVi,
        String nameEn,
        String descriptionVi,
        String descriptionEn,
        BigDecimal price,
        int inventoryQuantity,
        boolean visible,
        SellerCategoryResponse category,
        List<ProductImageResponse> images
) {
    public static SellerProductResponse from(
            Product product,
            Function<ProductImage, ProductImageResponse> imageResponseMapper
    ) {
        return new SellerProductResponse(
                product.getId(),
                product.getNameVi(),
                product.getNameEn(),
                product.getDescriptionVi(),
                product.getDescriptionEn(),
                product.getPrice(),
                product.getInventoryQuantity(),
                product.isVisible(),
                SellerCategoryResponse.from(product.getCategory()),
                product.getImages().stream().map(imageResponseMapper).toList()
        );
    }
}
