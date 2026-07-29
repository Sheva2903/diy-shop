package com.diyshop.settings;

import com.diyshop.settings.dto.ShopSettingsResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class ShopSettingsController {

    private final ShopSettingsService shopSettingsService;

    public ShopSettingsController(ShopSettingsService shopSettingsService) {
        this.shopSettingsService = shopSettingsService;
    }

    @GetMapping
    public ShopSettingsResponse getSettings() {
        return shopSettingsService.getSettingsResponse();
    }
}
