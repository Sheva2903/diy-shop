package com.diyshop.product.storage;

import java.io.InputStream;

public interface ProductImageStorage {

    StoredProductImage store(
            InputStream content,
            long contentLength,
            String contentType,
            String fileExtension
    );

    void delete(String storageKey);

    String getDisplayUrl(String storageKey);
}
