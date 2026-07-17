package com.diyshop.product;

import com.diyshop.common.exception.BadRequestException;
import com.diyshop.product.dto.ProductImageResponse;
import com.diyshop.product.storage.ProductImageStorage;
import com.diyshop.product.storage.ProductImageStorageProperties;
import com.diyshop.product.storage.StoredProductImage;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductImageServiceTests {

    @Test
    void uploadsAValidImageAndStoresOnlyItsStorageMetadata() {
        TestContext context = new TestContext();
        MockMultipartFile file = new MockMultipartFile(
                "image", "product.png", "image/png", "content".getBytes()
        );
        when(context.storage.store(any(), anyLong(), eq("image/png"), eq("png")))
                .thenReturn(new StoredProductImage("products/generated.png", "image/png"));
        when(context.imageRepository.saveAndFlush(any(ProductImage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(context.responseMapper.toResponse(any(ProductImage.class)))
                .thenReturn(new ProductImageResponse(null, "/media/product-images/generated.png", true, 1));

        TransactionSynchronizationManager.initSynchronization();
        ProductImageResponse response;
        try {
            response = context.service.addImage(1L, file, null, null);
            completeTransaction(TransactionSynchronization.STATUS_COMMITTED);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }

        assertEquals("/media/product-images/generated.png", response.imageUrl());
        verify(context.storage).store(any(), eq(7L), eq("image/png"), eq("png"));
        ArgumentCaptor<ProductImage> imageCaptor = ArgumentCaptor.forClass(ProductImage.class);
        verify(context.imageRepository).saveAndFlush(imageCaptor.capture());
        ProductImage savedImage = imageCaptor.getValue();
        assertEquals("products/generated.png", savedImage.getStorageKey());
        assertEquals("image/png", savedImage.getContentType());
        assertNull(savedImage.getImageUrl());
        assertTrue(savedImage.isPrimaryImage());
        assertEquals(1, savedImage.getSortOrder());
    }

    @Test
    void rejectsUnsupportedFilesBeforeUsingStorage() {
        TestContext context = new TestContext();
        MockMultipartFile file = new MockMultipartFile(
                "image", "payload.svg", "image/svg+xml", "content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> context.service.addImage(1L, file, null, null));

        verify(context.storage, never()).store(any(), anyLong(), any(), any());
    }

    @Test
    void rejectsFilesWithoutAContentType() {
        TestContext context = new TestContext();
        MockMultipartFile file = new MockMultipartFile(
                "image", "unknown", null, "content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> context.service.addImage(1L, file, null, null));

        verify(context.storage, never()).store(any(), anyLong(), any(), any());
    }

    @Test
    void deletesUploadedContentWhenTheDatabaseTransactionRollsBack() {
        TestContext context = new TestContext();
        MockMultipartFile file = new MockMultipartFile(
                "image", "product.png", "image/png", "content".getBytes()
        );
        when(context.storage.store(any(), anyLong(), eq("image/png"), eq("png")))
                .thenReturn(new StoredProductImage("products/rolled-back.png", "image/png"));
        when(context.imageRepository.saveAndFlush(any(ProductImage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TransactionSynchronizationManager.initSynchronization();
        try {
            context.service.addImage(1L, file, null, null);
            completeTransaction(TransactionSynchronization.STATUS_ROLLED_BACK);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }

        verify(context.storage).delete("products/rolled-back.png");
    }

    @Test
    void preventsDeletingTheLastImageOfAVisibleProduct() {
        TestContext context = new TestContext();
        Product product = new Product();
        product.setVisible(true);
        ProductImage image = new ProductImage();
        image.setProduct(product);
        when(context.productRepository.existsById(1L)).thenReturn(true);
        when(context.imageRepository.findByIdAndProduct_Id(10L, 1L)).thenReturn(Optional.of(image));
        when(context.imageRepository.countByProduct_Id(1L)).thenReturn(1L);

        assertThrows(BadRequestException.class, () -> context.service.deleteImage(1L, 10L));

        verify(context.imageRepository, never()).delete(any(ProductImage.class));
    }

    @Test
    void settingTheCurrentPrimaryImageAgainDoesNotClearIt() {
        TestContext context = new TestContext();
        ProductImage image = new ProductImage();
        image.setPrimaryImage(true);
        when(context.productRepository.existsById(1L)).thenReturn(true);
        when(context.imageRepository.findByIdAndProduct_Id(10L, 1L)).thenReturn(Optional.of(image));
        when(context.responseMapper.toResponse(image))
                .thenReturn(new ProductImageResponse(10L, "/image.png", true, 1));

        ProductImageResponse response = context.service.setPrimaryImage(1L, 10L);

        assertTrue(response.primaryImage());
        verify(context.imageRepository, never()).clearPrimaryImage(1L);
    }

    private static void completeTransaction(int status) {
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(synchronization -> synchronization.afterCompletion(status));
    }

    private static class TestContext {
        private final ProductRepository productRepository = mock(ProductRepository.class);
        private final ProductImageRepository imageRepository = mock(ProductImageRepository.class);
        private final ProductImageStorage storage = mock(ProductImageStorage.class);
        private final ProductImageResponseMapper responseMapper = mock(ProductImageResponseMapper.class);
        private final ProductImageService service;

        private TestContext() {
            ProductImageStorageProperties properties = new ProductImageStorageProperties();
            when(productRepository.findById(1L)).thenReturn(Optional.of(new Product()));
            service = new ProductImageService(
                    productRepository,
                    imageRepository,
                    storage,
                    properties,
                    responseMapper
            );
        }
    }
}
