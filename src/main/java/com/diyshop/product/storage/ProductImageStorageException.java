package com.diyshop.product.storage;

public class ProductImageStorageException extends RuntimeException {

    public ProductImageStorageException(String message) {
        super(message);
    }

    public ProductImageStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
