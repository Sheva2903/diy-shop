package com.diyshop.product;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            select distinct p
            from Product p
            left join fetch p.images
            join fetch p.category
            order by p.createdAt desc
            """)
    List<Product> findAllForSeller();

    @Query("""
            select p
            from Product p
            left join fetch p.images
            join fetch p.category
            where p.id = :id
            """)
    Optional<Product> findByIdForSeller(@Param("id") Long id);

    @Query("""
            select distinct p
            from Product p
            left join fetch p.images
            join fetch p.category c
            where p.visible = true
              and c.visible = true
              and (:categoryId is null or c.id = :categoryId)
              and (:keyword = ''
                   or lower(p.nameVi) like concat('%', lower(:keyword), '%')
                   or lower(p.nameEn) like concat('%', lower(:keyword), '%'))
              and (:minPrice is null or p.price >= :minPrice)
              and (:maxPrice is null or p.price <= :maxPrice)
            """)
    List<Product> findVisibleProducts(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query("""
            select distinct p
            from Product p
            left join fetch p.images
            join fetch p.category c
            where p.visible = true
              and c.visible = true
              and c.id = :categoryId
              and p.id <> :excludeId
            """)
    List<Product> findRelatedVisibleProducts(
            @Param("categoryId") Long categoryId,
            @Param("excludeId") Long excludeId,
            Pageable pageable
    );

    @Query("""
            select p
            from Product p
            left join fetch p.images
            join fetch p.category c
            where p.id = :id
              and p.visible = true
              and c.visible = true
            """)
    Optional<Product> findVisibleProductById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select p
            from Product p
            join p.category c
            where p.id = :id
              and p.visible = true
              and c.visible = true
            """)
    Optional<Product> findVisibleProductByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select p
            from Product p
            where p.id = :id
            """)
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    long countByCategory_Id(Long categoryId);

    @Query("select p.category.id, count(p) from Product p group by p.category.id")
    List<Object[]> countGroupedByCategory();
}
