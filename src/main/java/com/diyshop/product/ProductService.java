package com.diyshop.product;

import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.product.dto.ProductDetailResponse;
import com.diyshop.product.dto.ProductListResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
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

    public List<ProductListResponse> getVisibleProducts(
            Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, String sort, Integer limit
    ) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : "";
        Pageable pageable = toPageable(sort, limit);

        return productRepository.findVisibleProducts(categoryId, normalizedKeyword, minPrice, maxPrice, pageable).stream()
                .map(product -> ProductListResponse.from(product, imageResponseMapper::resolveUrl))
                .toList();
    }

    public List<ProductListResponse> getRelatedProducts(Long categoryId, Long excludeProductId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        return productRepository.findRelatedVisibleProducts(categoryId, excludeProductId, pageable).stream()
                .map(product -> ProductListResponse.from(product, imageResponseMapper::resolveUrl))
                .toList();
    }

    private Pageable toPageable(String sort, Integer limit) {
        Sort jpaSort = switch (sort == null ? "newest" : sort) {
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        return (limit != null && limit > 0) ? PageRequest.of(0, limit, jpaSort) : Pageable.unpaged(jpaSort);
    }

    public ProductDetailResponse getVisibleProduct(Long id) {
        Product product = productRepository.findVisibleProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return ProductDetailResponse.from(product, imageResponseMapper::toResponse);
    }
}
