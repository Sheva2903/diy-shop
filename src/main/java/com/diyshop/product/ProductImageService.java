package com.diyshop.product;

import com.diyshop.common.exception.BadRequestException;
import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.product.dto.ProductImageResponse;
import com.diyshop.product.storage.ProductImageStorage;
import com.diyshop.product.storage.ProductImageStorageProperties;
import com.diyshop.product.storage.StoredProductImage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class ProductImageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductImageService.class);
    private static final Map<String, String> ALLOWED_CONTENT_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductImageStorage storage;
    private final ProductImageStorageProperties storageProperties;
    private final ProductImageResponseMapper responseMapper;

    public ProductImageService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ProductImageStorage storage,
            ProductImageStorageProperties storageProperties,
            ProductImageResponseMapper responseMapper
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.storage = storage;
        this.storageProperties = storageProperties;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(Long productId) {
        ensureProductExists(productId);

        return productImageRepository.findByProduct_IdOrderByPrimaryImageDescSortOrderAscIdAsc(productId)
                .stream()
                .map(responseMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductImageResponse addImage(
            Long productId,
            MultipartFile file,
            Boolean primaryImage,
            Integer sortOrder
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String contentType = validateAndGetContentType(file);
        StoredProductImage storedImage = store(file, contentType);
        deleteStoredImageOnRollback(storedImage.storageKey());

        boolean firstImage = !productImageRepository.existsByProduct_Id(productId);
        boolean shouldBePrimary = firstImage || Boolean.TRUE.equals(primaryImage);

        if (shouldBePrimary) {
            productImageRepository.clearPrimaryImage(productId);
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setStorageKey(storedImage.storageKey());
        image.setContentType(storedImage.contentType());
        image.setPrimaryImage(shouldBePrimary);
        image.setSortOrder(resolveSortOrder(productId, sortOrder));

        ProductImage savedImage = productImageRepository.saveAndFlush(image);
        return responseMapper.toResponse(savedImage);
    }

    private StoredProductImage store(MultipartFile file, String contentType) {
        try (InputStream content = file.getInputStream()) {
            return storage.store(
                    content,
                    file.getSize(),
                    contentType,
                    ALLOWED_CONTENT_TYPES.get(contentType)
            );
        } catch (IOException exception) {
            throw new BadRequestException("Could not read uploaded image");
        }
    }

    private String validateAndGetContentType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        long maxFileSizeBytes = storageProperties.getMaxFileSize().toBytes();
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException(
                    "Image file exceeds the maximum size of "
                            + maxFileSizeBytes
                            + " bytes"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.containsKey(contentType)) {
            throw new BadRequestException("Image must be JPEG, PNG, or WebP");
        }
        return contentType;
    }

    @Transactional
    public ProductImageResponse setPrimaryImage(Long productId, Long imageId) {
        ProductImage image = getImageForProduct(productId, imageId);

        if (image.isPrimaryImage()) {
            return responseMapper.toResponse(image);
        }

        productImageRepository.clearPrimaryImage(productId);

        image.setPrimaryImage(true);
        ProductImage savedImage = productImageRepository.save(image);

        return responseMapper.toResponse(savedImage);
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = getImageForProduct(productId, imageId);

        boolean deletedImageWasPrimary = image.isPrimaryImage();
        String storageKey = image.getStorageKey();

        if (image.getProduct().isVisible() && productImageRepository.countByProduct_Id(productId) == 1) {
            throw new BadRequestException("A visible product must keep at least one image");
        }

        productImageRepository.delete(image);
        productImageRepository.flush();

        if (deletedImageWasPrimary) {
            productImageRepository.findFirstByProduct_IdOrderBySortOrderAscIdAsc(productId)
                    .ifPresent(nextImage -> {
                        nextImage.setPrimaryImage(true);
                        productImageRepository.save(nextImage);
                    });
        }

        if (storageKey != null) {
            deleteAfterCommit(storageKey);
        }
    }

    @Transactional(readOnly = true)
    public boolean productHasImages(Long productId) {
        return productImageRepository.existsByProduct_Id(productId);
    }

    private ProductImage getImageForProduct(Long productId, Long imageId) {
        ensureProductExists(productId);

        return productImageRepository.findByIdAndProduct_Id(imageId, productId)
                .orElseThrow(() -> notFound("Product image not found: " + imageId));
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw notFound("Product not found: " + productId);
        }
    }

    private int resolveSortOrder(Long productId, Integer requestedSortOrder) {
        if (requestedSortOrder != null) {
            return requestedSortOrder;
        }

        return (int) productImageRepository.countByProduct_Id(productId) + 1;
    }

    private ResourceNotFoundException notFound(String message) {
        return new ResourceNotFoundException(message);
    }

    private void deleteAfterCommit(String storageKey) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    storage.delete(storageKey);
                } catch (RuntimeException exception) {
                    LOGGER.error("Could not delete stored product image {}", storageKey, exception);
                }
            }
        });
    }

    private void deleteStoredImageOnRollback(String storageKey) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == TransactionSynchronization.STATUS_COMMITTED) {
                    return;
                }

                try {
                    storage.delete(storageKey);
                } catch (RuntimeException exception) {
                    LOGGER.error("Could not clean up rolled-back product image {}", storageKey, exception);
                }
            }
        });
    }
}
