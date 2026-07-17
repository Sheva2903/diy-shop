package com.diyshop.product.dto;

import com.diyshop.product.ProductImage;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        boolean primaryImage,
        int sortOrder
) {
    public static ProductImageResponse from(ProductImage image, String imageUrl) {
        return new ProductImageResponse(
                image.getId(),
                imageUrl,
                image.isPrimaryImage(),
                image.getSortOrder()
        );
    }
}
