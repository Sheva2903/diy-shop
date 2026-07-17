package com.diyshop.product;

import com.diyshop.product.dto.ProductImageResponse;
import com.diyshop.product.storage.ProductImageStorage;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ProductImageResponseMapper {

    private final ProductImageStorage storage;

    public ProductImageResponseMapper(ProductImageStorage storage) {
        this.storage = storage;
    }

    public ProductImageResponse toResponse(ProductImage image) {
        return ProductImageResponse.from(image, resolveUrl(image));
    }

    public String resolveUrl(ProductImage image) {
        if (StringUtils.hasText(image.getStorageKey())) {
            return storage.getDisplayUrl(image.getStorageKey());
        }
        return image.getImageUrl();
    }
}
