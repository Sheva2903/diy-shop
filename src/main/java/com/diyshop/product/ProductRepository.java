package com.diyshop.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
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
              and (:keyword = ''
                   or lower(p.nameVi) like concat('%', lower(:keyword), '%')
                   or lower(p.nameEn) like concat('%', lower(:keyword), '%'))
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
}
