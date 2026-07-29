package com.diyshop.settings.dto;

import com.diyshop.banktransfer.VietQrTemplate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateShopSettingsRequest(
        @NotBlank @Size(max = 150) String shopName,
        @NotNull String descriptionVi,
        @NotNull String descriptionEn,
        @Size(max = 500) String logoUrl,
        @NotNull @Email @Size(max = 254) String contactEmail,
        @NotNull @Size(max = 30) String contactPhone,

        @NotBlank @Size(max = 100) String bankName,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]+") @Size(max = 50) String bankCode,
        @NotBlank @Pattern(regexp = "\\d{6}") String bankBin,
        @NotBlank @Pattern(regexp = "\\d{6,19}") String accountNumber,
        @NotBlank @Size(max = 150) String accountName,
        @NotNull VietQrTemplate vietqrTemplate,
        @Min(1) @Max(168) int paymentDueHours,

        @NotNull @DecimalMin("0") BigDecimal shippingFlatFee,
        @DecimalMin("0") BigDecimal freeShippingThreshold,
        @NotNull String shippingNoteVi,
        @NotNull String shippingNoteEn
) {
}
