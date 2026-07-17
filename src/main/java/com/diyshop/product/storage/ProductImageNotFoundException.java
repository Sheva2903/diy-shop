package com.diyshop.product.storage;

import com.diyshop.common.exception.ResourceNotFoundException;

public class ProductImageNotFoundException extends ResourceNotFoundException {

    public ProductImageNotFoundException() {
        super("Product image not found");
    }
}
