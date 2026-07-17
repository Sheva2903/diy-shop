package com.diyshop.product;

import com.diyshop.product.dto.SellerProductResponse;
import com.diyshop.product.dto.UpdateInventoryRequest;
import com.diyshop.product.dto.UpdateProductVisibilityRequest;
import com.diyshop.product.dto.UpsertProductRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
public class SellerProductController {

    private final SellerProductService sellerProductService;

    public SellerProductController(SellerProductService sellerProductService) {
        this.sellerProductService = sellerProductService;
    }

    @GetMapping
    public List<SellerProductResponse> getProducts() {
        return sellerProductService.getProducts();
    }

    @GetMapping("/{id}")
    public SellerProductResponse getProduct(@PathVariable Long id) {
        return sellerProductService.getProduct(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SellerProductResponse createProduct(@Valid @RequestBody UpsertProductRequest request) {
        return sellerProductService.createProduct(request);
    }

    @PutMapping("/{id}")
    public SellerProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpsertProductRequest request
    ) {
        return sellerProductService.updateProduct(id, request);
    }

    @PatchMapping("/{id}/visibility")
    public SellerProductResponse updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductVisibilityRequest request
    ) {
        return sellerProductService.updateVisibility(id, request);
    }

    @PatchMapping("/{id}/inventory")
    public SellerProductResponse updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryRequest request
    ) {
        return sellerProductService.updateInventory(id, request);
    }
}
