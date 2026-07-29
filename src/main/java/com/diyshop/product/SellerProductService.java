package com.diyshop.product;

import com.diyshop.category.Category;
import com.diyshop.category.CategoryRepository;
import com.diyshop.common.exception.BadRequestException;
import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.order.OrderItemRepository;
import com.diyshop.product.dto.SellerProductResponse;
import com.diyshop.product.dto.UpdateInventoryRequest;
import com.diyshop.product.dto.UpdateProductVisibilityRequest;
import com.diyshop.product.dto.UpsertProductRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SellerProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageService productImageService;
    private final ProductImageResponseMapper imageResponseMapper;
    private final OrderItemRepository orderItemRepository;

    public SellerProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageService productImageService,
            ProductImageResponseMapper imageResponseMapper,
            OrderItemRepository orderItemRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageService = productImageService;
        this.imageResponseMapper = imageResponseMapper;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional(readOnly = true)
    public List<SellerProductResponse> getProducts() {
        return productRepository.findAllForSeller().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SellerProductResponse getProduct(Long id) {
        return toResponse(findProduct(id));
    }

    @Transactional
    public SellerProductResponse createProduct(UpsertProductRequest request) {
        Product product = new Product();
        apply(product, request);
        validateCanBeVisible(product, request.visible());
        product.setVisible(request.visible());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public SellerProductResponse updateProduct(Long id, UpsertProductRequest request) {
        Product product = findProduct(id);
        apply(product, request);
        validateCanBeVisible(product, request.visible());
        product.setVisible(request.visible());

        return toResponse(product);
    }

    @Transactional
    public SellerProductResponse updateVisibility(Long id, UpdateProductVisibilityRequest request) {
        Product product = findProduct(id);
        validateCanBeVisible(product, request.visible());
        product.setVisible(request.visible());

        return toResponse(product);
    }

    @Transactional
    public SellerProductResponse updateInventory(Long id, UpdateInventoryRequest request) {
        Product product = findProduct(id);
        product.setInventoryQuantity(request.inventoryQuantity());

        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProduct(id);

        if (orderItemRepository.existsByProduct_Id(id)) {
            throw new BadRequestException("Product is referenced by an existing order and cannot be deleted");
        }

        productRepository.delete(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findByIdForSeller(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void apply(Product product, UpsertProductRequest request) {
        product.setNameVi(request.nameVi().trim());
        product.setNameEn(request.nameEn().trim());
        product.setDescriptionVi(request.descriptionVi().trim());
        product.setDescriptionEn(request.descriptionEn().trim());
        product.setPrice(request.price());
        product.setInventoryQuantity(request.inventoryQuantity());
        product.setCategory(findCategory(request.categoryId()));
    }

    private void validateCanBeVisible(Product product, boolean visible) {
        if (!visible) {
            return;
        }

        if (!product.getCategory().isVisible()) {
            throw new BadRequestException("A visible product must belong to a visible category");
        }

        if (product.getId() == null || !productImageService.productHasImages(product.getId())) {
            throw new BadRequestException("A product must have at least one image before it can be visible");
        }
    }

    private SellerProductResponse toResponse(Product product) {
        return SellerProductResponse.from(product, imageResponseMapper::toResponse);
    }
}
