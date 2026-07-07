package com.diyshop.product;

import com.diyshop.product.dto.AddProductImageRequest;
import com.diyshop.product.dto.ProductImageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {
    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @GetMapping
    public List<ProductImageResponse> getImages(@PathVariable Long productId) {
        return productImageService.getImages(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse addImage(
            @PathVariable Long productId,
            @Valid @RequestBody AddProductImageRequest request) {
        return productImageService.addImage(productId, request);
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
}