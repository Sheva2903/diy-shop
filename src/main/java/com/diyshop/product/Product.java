package com.diyshop.product;

import com.diyshop.category.Category;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_vi", nullable = false, length = 200)
    private String nameVi;

    @Column(name = "name_en", nullable = false, length = 200)
    private String nameEn;

    @Column(name = "description_vi", nullable = false, columnDefinition = "text")
    private String descriptionVi;

    @Column(name = "description_en", nullable = false, columnDefinition = "text")
    private String descriptionEn;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "inventory_quantity", nullable = false)
    private int inventoryQuantity;

    @Column(nullable = false)
    private boolean visible;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "product")
    @OrderBy("primaryImage DESC, sortOrder ASC, id ASC")
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public String getNameVi() {
        return nameVi;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getDescriptionVi() {
        return descriptionVi;
    }

    public String getDescriptionEn() {
        return descriptionEn;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getInventoryQuantity() {
        return inventoryQuantity;
    }

    public boolean isVisible() {
        return visible;
    }

    public Category getCategory() {
        return category;
    }

    public List<ProductImage> getImages() {
        return images;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setNameVi(String nameVi) {
        this.nameVi = nameVi;
        touch();
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
        touch();
    }

    public void setDescriptionVi(String descriptionVi) {
        this.descriptionVi = descriptionVi;
        touch();
    }

    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
        touch();
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
        touch();
    }

    public void setInventoryQuantity(int inventoryQuantity) {
        if (inventoryQuantity < 0) {
            throw new IllegalArgumentException("Inventory quantity cannot be negative");
        }

        this.inventoryQuantity = inventoryQuantity;
        touch();
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
        touch();
    }

    public void setCategory(Category category) {
        this.category = category;
        touch();
    }

    public void decreaseInventory(int quantity) {
        if (quantity > inventoryQuantity) {
            throw new IllegalArgumentException("Insufficient inventory");
        }

        inventoryQuantity -= quantity;
        touch();
    }

    public void increaseInventory(int quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        inventoryQuantity += quantity;
        touch();
    }

    private void touch() {
        updatedAt = Instant.now();
    }

    @PrePersist
    private void initializeTimestamps() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }
}
