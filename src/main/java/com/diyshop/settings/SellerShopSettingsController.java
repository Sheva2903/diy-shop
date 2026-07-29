package com.diyshop.settings;

import com.diyshop.settings.dto.ShopSettingsResponse;
import com.diyshop.settings.dto.UpdateShopSettingsRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seller/settings")
public class SellerShopSettingsController {

    private final ShopSettingsService shopSettingsService;

    public SellerShopSettingsController(ShopSettingsService shopSettingsService) {
        this.shopSettingsService = shopSettingsService;
    }

    @GetMapping
    public ShopSettingsResponse getSettings() {
        return shopSettingsService.getSettingsResponse();
    }

    @PutMapping
    public ShopSettingsResponse updateSettings(@Valid @RequestBody UpdateShopSettingsRequest request) {
        return shopSettingsService.updateSettings(request);
    }
}
