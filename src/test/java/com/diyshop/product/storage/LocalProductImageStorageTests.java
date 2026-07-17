package com.diyshop.product.storage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalProductImageStorageTests {

    @TempDir
    Path temporaryDirectory;

    @Test
    void storesLoadsAndDeletesAnImage() throws Exception {
        ProductImageStorageProperties properties = new ProductImageStorageProperties();
        properties.setLocalDirectory(temporaryDirectory);
        LocalProductImageStorage storage = new LocalProductImageStorage(properties);
        byte[] content = "image-content".getBytes();

        StoredProductImage stored = storage.store(
                new ByteArrayInputStream(content),
                content.length,
                "image/png",
                "png"
        );

        String filename = stored.storageKey().substring("products/".length());
        Path storedFile = temporaryDirectory.resolve(filename);
        assertTrue(Files.exists(storedFile));
        assertArrayEquals(content, storage.load(filename).getContentAsByteArray());
        assertTrue(storage.getDisplayUrl(stored.storageKey()).startsWith("/media/product-images/"));

        storage.delete(stored.storageKey());

        assertFalse(Files.exists(storedFile));
    }
}
