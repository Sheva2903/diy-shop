package com.diyshop.product;

import com.diyshop.category.Category;
import com.diyshop.category.CategoryRepository;
import com.diyshop.common.exception.BadRequestException;
import com.diyshop.order.OrderItemRepository;
import com.diyshop.product.dto.UpsertProductRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SellerProductServiceTests {

    @Test
    void rejectsPublishingANewProductBeforeItHasAnImage() {
        ProductRepository productRepository = mock(ProductRepository.class);
        CategoryRepository categoryRepository = mock(CategoryRepository.class);
        ProductImageService productImageService = mock(ProductImageService.class);
        ProductImageResponseMapper imageResponseMapper = mock(ProductImageResponseMapper.class);
        OrderItemRepository orderItemRepository = mock(OrderItemRepository.class);
        Category category = new Category();
        category.setVisible(true);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        SellerProductService service = new SellerProductService(
                productRepository,
                categoryRepository,
                productImageService,
                imageResponseMapper,
                orderItemRepository
        );

        UpsertProductRequest request = new UpsertProductRequest(
                "San pham",
                "Product",
                "Mo ta",
                "Description",
                new BigDecimal("100000"),
                1,
                1L,
                true
        );

        assertThrows(BadRequestException.class, () -> service.createProduct(request));

        verify(productRepository, never()).save(any(Product.class));
    }
}
