package com.diyshop.product.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "shop.image-storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalProductImageStorage implements ProductImageStorage {

    private static final String KEY_PREFIX = "products/";

    private final Path rootDirectory;

    public LocalProductImageStorage(ProductImageStorageProperties properties) {
        this.rootDirectory = properties.getLocalDirectory().toAbsolutePath().normalize();
    }

    @Override
    public StoredProductImage store(
            InputStream content,
            long contentLength,
            String contentType,
            String fileExtension
    ) {
        String filename = UUID.randomUUID() + "." + fileExtension;
        Path destination = resolveFilename(filename);

        try {
            Files.createDirectories(rootDirectory);
            Path temporaryFile = Files.createTempFile(rootDirectory, "upload-", ".tmp");

            try {
                Files.copy(content, temporaryFile, StandardCopyOption.REPLACE_EXISTING);
                moveIntoPlace(temporaryFile, destination);
            } finally {
                Files.deleteIfExists(temporaryFile);
            }

            return new StoredProductImage(KEY_PREFIX + filename, contentType);
        } catch (IOException exception) {
            throw new ProductImageStorageException("Could not store product image", exception);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(resolveStorageKey(storageKey));
        } catch (IOException exception) {
            throw new ProductImageStorageException("Could not delete product image", exception);
        }
    }

    @Override
    public String getDisplayUrl(String storageKey) {
        return "/media/product-images/" + resolveStorageKey(storageKey).getFileName();
    }

    public Resource load(String filename) {
        try {
            Path path = resolveFilename(filename);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ProductImageNotFoundException();
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new ProductImageNotFoundException();
        }
    }

    private Path resolveStorageKey(String storageKey) {
        if (storageKey == null || !storageKey.startsWith(KEY_PREFIX)) {
            throw new ProductImageStorageException("Invalid product image storage key");
        }
        return resolveFilename(storageKey.substring(KEY_PREFIX.length()));
    }

    private Path resolveFilename(String filename) {
        if (filename == null || filename.contains("/") || filename.contains("\\")) {
            throw new ProductImageNotFoundException();
        }

        Path path = rootDirectory.resolve(filename).normalize();
        if (!path.startsWith(rootDirectory)) {
            throw new ProductImageNotFoundException();
        }
        return path;
    }

    private void moveIntoPlace(Path source, Path destination) throws IOException {
        try {
            Files.move(source, destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException exception) {
            Files.move(source, destination, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
