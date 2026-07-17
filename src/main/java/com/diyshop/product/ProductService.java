package com.diyshop.product;

import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.product.dto.ProductDetailResponse;
import com.diyshop.product.dto.ProductListResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageResponseMapper imageResponseMapper;

    public ProductService(
            ProductRepository productRepository,
            ProductImageResponseMapper imageResponseMapper
    ) {
        this.productRepository = productRepository;
        this.imageResponseMapper = imageResponseMapper;
    }

    public List<ProductListResponse> getVisibleProducts(Long categoryId, String keyword) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : "";

        return productRepository.findVisibleProducts(categoryId, normalizedKeyword).stream()
                .map(product -> ProductListResponse.from(product, imageResponseMapper::resolveUrl))
                .toList();
    }

    public ProductDetailResponse getVisibleProduct(Long id) {
        Product product = productRepository.findVisibleProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return ProductDetailResponse.from(product, imageResponseMapper::toResponse);
    }
}
