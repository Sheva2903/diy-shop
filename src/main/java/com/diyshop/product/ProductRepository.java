package com.diyshop.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            select distinct p
            from Product p
            left join fetch p.images
            join fetch p.category c
            where p.visible = true
              and c.visible = true
              and (:categoryId is null or c.id = :categoryId)
              and (:keyword is null
                   or lower(p.nameVi) like lower(concat('%', :keyword, '%'))
                   or lower(p.nameEn) like lower(concat('%', :keyword, '%')))
            order by p.createdAt desc
            """)
    List<Product> findVisibleProducts(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword
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
}
