package com.diyshop.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "shop.seller")
public record SellerProperties(
        @NotBlank String username,
        @NotBlank String passwordHash
) {
}
