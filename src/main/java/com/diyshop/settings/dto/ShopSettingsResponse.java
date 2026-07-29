package com.diyshop.settings.dto;

import com.diyshop.banktransfer.VietQrTemplate;
import com.diyshop.settings.ShopSettings;

import java.math.BigDecimal;
import java.time.Instant;

public record ShopSettingsResponse(
        String shopName,
        String descriptionVi,
        String descriptionEn,
        String logoUrl,
        String contactEmail,
        String contactPhone,
        String bankName,
        String bankCode,
        String bankBin,
        String accountNumber,
        String accountName,
        VietQrTemplate vietqrTemplate,
        int paymentDueHours,
        BigDecimal shippingFlatFee,
        BigDecimal freeShippingThreshold,
        String shippingNoteVi,
        String shippingNoteEn,
        Instant updatedAt
) {
    public static ShopSettingsResponse from(ShopSettings settings) {
        return new ShopSettingsResponse(
                settings.getShopName(),
                settings.getDescriptionVi(),
                settings.getDescriptionEn(),
                settings.getLogoUrl(),
                settings.getContactEmail(),
                settings.getContactPhone(),
                settings.getBankName(),
                settings.getBankCode(),
                settings.getBankBin(),
                settings.getAccountNumber(),
                settings.getAccountName(),
                settings.getVietqrTemplate(),
                settings.getPaymentDueHours(),
                settings.getShippingFlatFee(),
                settings.getFreeShippingThreshold(),
                settings.getShippingNoteVi(),
                settings.getShippingNoteEn(),
                settings.getUpdatedAt()
        );
    }
}
