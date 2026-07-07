package com.diyshop.product;

import com.diyshop.product.dto.AddProductImageRequest;
import com.diyshop.product.dto.ProductImageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductImageService {
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public ProductImageService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(Long productId) {
        ensureProductExists(productId);

        return productImageRepository.findByProduct_IdOrderByPrimaryImageDescSortOrderAscIdAsc(productId)
                .stream()
                .map(ProductImageResponse::from)
                .toList();
    }

    @Transactional
    public ProductImageResponse addImage(Long productId, AddProductImageRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> notFound("Product not found: " + productId));

        boolean firstImage = !productImageRepository.existsByProduct_Id(productId);
        boolean shouldBePrimary = firstImage || Boolean.TRUE.equals(request.primaryImage());

        if (shouldBePrimary) {
            productImageRepository.clearPrimaryImage(productId);
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.imageUrl());
        image.setPrimaryImage(shouldBePrimary);
        image.setSortOrder(resolveSortOrder(productId, request.sortOrder()));

        ProductImage savedImage = productImageRepository.save(image);

        return ProductImageResponse.from(savedImage);
    }

    @Transactional
    public ProductImageResponse setPrimaryImage(Long productId, Long imageId) {
        ProductImage image = getImageForProduct(productId, imageId);

        productImageRepository.clearPrimaryImage(productId);

        image.setPrimaryImage(true);
        ProductImage savedImage = productImageRepository.save(image);

        return ProductImageResponse.from(savedImage);
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = getImageForProduct(productId, imageId);

        boolean deletedImageWasPrimary = image.isPrimaryImage();

        productImageRepository.delete(image);
        productImageRepository.flush();

        if (deletedImageWasPrimary) {
            productImageRepository.findFirstByProduct_IdOrderBySortOrderAscIdAsc(productId)
                    .ifPresent(nextImage -> {
                        nextImage.setPrimaryImage(true);
                        productImageRepository.save(nextImage);
                    });
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

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}