package com.diyshop.category;

import com.diyshop.category.dto.SellerCategoryResponse;
import com.diyshop.category.dto.UpdateCategoryVisibilityRequest;
import com.diyshop.category.dto.UpsertCategoryRequest;
import com.diyshop.common.exception.BadRequestException;
import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SellerCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public SellerCategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<SellerCategoryResponse> getCategories() {
        Map<Long, Long> productCountsByCategory = productRepository.countGroupedByCategory().stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));

        return categoryRepository.findAllByOrderByNameEnAsc().stream()
                .map(category -> SellerCategoryResponse.from(
                        category, productCountsByCategory.getOrDefault(category.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public SellerCategoryResponse getCategory(Long id) {
        Category category = findCategory(id);
        return SellerCategoryResponse.from(category, productRepository.countByCategory_Id(category.getId()));
    }

    @Transactional
    public SellerCategoryResponse createCategory(UpsertCategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        category.setVisible(true);

        return SellerCategoryResponse.from(categoryRepository.save(category), 0L);
    }

    @Transactional
    public SellerCategoryResponse updateCategory(Long id, UpsertCategoryRequest request) {
        Category category = findCategory(id);
        apply(category, request);

        return SellerCategoryResponse.from(category, productRepository.countByCategory_Id(category.getId()));
    }

    @Transactional
    public SellerCategoryResponse updateVisibility(Long id, UpdateCategoryVisibilityRequest request) {
        Category category = findCategory(id);
        category.setVisible(request.visible());

        return SellerCategoryResponse.from(category, productRepository.countByCategory_Id(category.getId()));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);

        if (productRepository.countByCategory_Id(id) > 0) {
            throw new BadRequestException("Category has products and cannot be deleted");
        }

        categoryRepository.delete(category);
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
