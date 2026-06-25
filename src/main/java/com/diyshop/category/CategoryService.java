package com.diyshop.category;

import com.diyshop.category.dto.CategoryResponse;
import com.diyshop.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getVisibleCategories() {
        return categoryRepository.findByVisibleTrueOrderByNameEnAsc().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse getVisibleCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .filter(Category::isVisible)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        return CategoryResponse.from(category);
    }
}
