package com.diyshop.product;

import com.diyshop.product.dto.ProductDetailResponse;
import com.diyshop.product.dto.ProductListResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductListResponse> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword
    ) {
        return productService.getVisibleProducts(categoryId, keyword);
    }

    @GetMapping("/{id}")
    public ProductDetailResponse getProduct(@PathVariable Long id) {
        return productService.getVisibleProduct(id);
    }
}
