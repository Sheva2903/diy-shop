package com.diyshop.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct_IdOrderByPrimaryImageDescSortOrderAscIdAsc(Long productId);

    Optional<ProductImage> findByIdAndProduct_Id(Long id, Long productId);

    boolean existsByProduct_Id(Long productId);

    long countByProduct_Id(Long productId);

    Optional<ProductImage> findFirstByProduct_IdOrderBySortOrderAscIdAsc(Long productId);

    @Modifying
    @Query("""
            update ProductImage image
            set image.primaryImage = false
            where image.product.id = :productId
            """)
    void clearPrimaryImage(@Param("productId") Long productId);
}
