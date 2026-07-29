package com.diyshop.settings;

import com.diyshop.banktransfer.VietQrTemplate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * The one editable settings row. {@link #SINGLETON_ID} is enforced by a check
 * constraint in the schema, so there is never more than one.
 */
@Entity
@Table(name = "shop_settings")
public class ShopSettings {

    public static final short SINGLETON_ID = 1;

    @Id
    private Short id;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String shopName;

    @Column(name = "description_vi", nullable = false)
    private String descriptionVi;

    @Column(name = "description_en", nullable = false)
    private String descriptionEn;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "contact_email", nullable = false, length = 254)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false, length = 30)
    private String contactPhone;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "bank_code", nullable = false, length = 50)
    private String bankCode;

    @Column(name = "bank_bin", nullable = false, length = 20)
    private String bankBin;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "account_name", nullable = false, length = 150)
    private String accountName;

    @Column(name = "vietqr_template", nullable = false, length = 20)
    private String vietqrTemplate;

    @Column(name = "payment_due_hours", nullable = false)
    private int paymentDueHours;

    @Column(name = "shipping_flat_fee", nullable = false)
    private BigDecimal shippingFlatFee;

    @Column(name = "free_shipping_threshold")
    private BigDecimal freeShippingThreshold;

    @Column(name = "shipping_note_vi", nullable = false)
    private String shippingNoteVi;

    @Column(name = "shipping_note_en", nullable = false)
    private String shippingNoteEn;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Short getId() {
        return id;
    }

    public String getShopName() {
        return shopName;
    }

    public String getDescriptionVi() {
        return descriptionVi;
    }

    public String getDescriptionEn() {
        return descriptionEn;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getBankName() {
        return bankName;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getBankBin() {
        return bankBin;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    /** Stored as the VietQR image code, which is also what the check constraint allows. */
    public VietQrTemplate getVietqrTemplate() {
        return VietQrTemplate.fromImageCode(vietqrTemplate);
    }

    public int getPaymentDueHours() {
        return paymentDueHours;
    }

    public BigDecimal getShippingFlatFee() {
        return shippingFlatFee;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public String getShippingNoteVi() {
        return shippingNoteVi;
    }

    public String getShippingNoteEn() {
        return shippingNoteEn;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public void setDescriptionVi(String descriptionVi) {
        this.descriptionVi = descriptionVi;
    }

    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public void setBankBin(String bankBin) {
        this.bankBin = bankBin;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public void setVietqrTemplate(VietQrTemplate vietqrTemplate) {
        this.vietqrTemplate = vietqrTemplate.imageCode();
    }

    public void setPaymentDueHours(int paymentDueHours) {
        this.paymentDueHours = paymentDueHours;
    }

    public void setShippingFlatFee(BigDecimal shippingFlatFee) {
        this.shippingFlatFee = shippingFlatFee;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public void setShippingNoteVi(String shippingNoteVi) {
        this.shippingNoteVi = shippingNoteVi;
    }

    public void setShippingNoteEn(String shippingNoteEn) {
        this.shippingNoteEn = shippingNoteEn;
    }

    public void markUpdated() {
        updatedAt = Instant.now();
    }
}
