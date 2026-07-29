package com.diyshop.settings;

import com.diyshop.settings.dto.ShopSettingsResponse;
import com.diyshop.settings.dto.UpdateShopSettingsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ShopSettingsService {

    private final ShopSettingsRepository shopSettingsRepository;

    public ShopSettingsService(ShopSettingsRepository shopSettingsRepository) {
        this.shopSettingsRepository = shopSettingsRepository;
    }

    /**
     * The row is seeded by migration V9 and cannot be deleted, so a missing row
     * means the schema was tampered with rather than an ordinary not-found.
     */
    public ShopSettings getSettings() {
        return shopSettingsRepository.findById(ShopSettings.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("Shop settings row is missing"));
    }

    public ShopSettingsResponse getSettingsResponse() {
        return ShopSettingsResponse.from(getSettings());
    }

    @Transactional
    public ShopSettingsResponse updateSettings(UpdateShopSettingsRequest request) {
        ShopSettings settings = getSettings();

        settings.setShopName(request.shopName());
        settings.setDescriptionVi(request.descriptionVi());
        settings.setDescriptionEn(request.descriptionEn());
        settings.setLogoUrl(request.logoUrl());
        settings.setContactEmail(request.contactEmail());
        settings.setContactPhone(request.contactPhone());

        settings.setBankName(request.bankName());
        settings.setBankCode(request.bankCode());
        settings.setBankBin(request.bankBin());
        settings.setAccountNumber(request.accountNumber());
        settings.setAccountName(request.accountName());
        settings.setVietqrTemplate(request.vietqrTemplate());
        settings.setPaymentDueHours(request.paymentDueHours());

        settings.setShippingFlatFee(request.shippingFlatFee());
        settings.setFreeShippingThreshold(request.freeShippingThreshold());
        settings.setShippingNoteVi(request.shippingNoteVi());
        settings.setShippingNoteEn(request.shippingNoteEn());

        settings.markUpdated();

        return ShopSettingsResponse.from(settings);
    }
}
