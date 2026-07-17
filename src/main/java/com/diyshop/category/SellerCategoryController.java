package com.diyshop.category;

import com.diyshop.category.dto.SellerCategoryResponse;
import com.diyshop.category.dto.UpdateCategoryVisibilityRequest;
import com.diyshop.category.dto.UpsertCategoryRequest;
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
@RequestMapping("/api/seller/categories")
public class SellerCategoryController {

    private final SellerCategoryService sellerCategoryService;

    public SellerCategoryController(SellerCategoryService sellerCategoryService) {
        this.sellerCategoryService = sellerCategoryService;
    }

    @GetMapping
    public List<SellerCategoryResponse> getCategories() {
        return sellerCategoryService.getCategories();
    }

    @GetMapping("/{id}")
    public SellerCategoryResponse getCategory(@PathVariable Long id) {
        return sellerCategoryService.getCategory(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SellerCategoryResponse createCategory(@Valid @RequestBody UpsertCategoryRequest request) {
        return sellerCategoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public SellerCategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpsertCategoryRequest request
    ) {
        return sellerCategoryService.updateCategory(id, request);
    }

    @PatchMapping("/{id}/visibility")
    public SellerCategoryResponse updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryVisibilityRequest request
    ) {
        return sellerCategoryService.updateVisibility(id, request);
    }
}
