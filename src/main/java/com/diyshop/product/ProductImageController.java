package com.diyshop.product;

import com.diyshop.product.dto.ProductImageResponse;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products/{productId}/images")
@Validated
public class ProductImageController {
    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @GetMapping
    public List<ProductImageResponse> getImages(@PathVariable Long productId) {
        return productImageService.getImages(productId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse addImage(
            @PathVariable Long productId,
            @RequestPart("image") MultipartFile image,
            @RequestParam(required = false) Boolean primaryImage,
            @RequestParam(required = false) @PositiveOrZero Integer sortOrder
    ) {
        return productImageService.addImage(productId, image, primaryImage, sortOrder);
    }

    @PatchMapping("/{imageId}/primary")
    public ProductImageResponse setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return productImageService.setPrimaryImage(productId, imageId);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        productImageService.deleteImage(productId, imageId);
    }

    @PutMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderImages(
            @PathVariable Long productId,
            @RequestBody List<Long> orderedImageIds) {
        productImageService.reorderImages(productId, orderedImageIds);
    }
}
