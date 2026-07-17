package com.diyshop.category;

import com.diyshop.category.dto.SellerCategoryResponse;
import com.diyshop.category.dto.UpdateCategoryVisibilityRequest;
import com.diyshop.category.dto.UpsertCategoryRequest;
import com.diyshop.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SellerCategoryService {

    private final CategoryRepository categoryRepository;

    public SellerCategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<SellerCategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderByNameEnAsc().stream()
                .map(SellerCategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SellerCategoryResponse getCategory(Long id) {
        return SellerCategoryResponse.from(findCategory(id));
    }

    @Transactional
    public SellerCategoryResponse createCategory(UpsertCategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        category.setVisible(true);

        return SellerCategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public SellerCategoryResponse updateCategory(Long id, UpsertCategoryRequest request) {
        Category category = findCategory(id);
        apply(category, request);

        return SellerCategoryResponse.from(category);
    }

    @Transactional
    public SellerCategoryResponse updateVisibility(Long id, UpdateCategoryVisibilityRequest request) {
        Category category = findCategory(id);
        category.setVisible(request.visible());

        return SellerCategoryResponse.from(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void apply(Category category, UpsertCategoryRequest request) {
        category.setNameVi(request.nameVi().trim());
        category.setNameEn(request.nameEn().trim());
    }
}
