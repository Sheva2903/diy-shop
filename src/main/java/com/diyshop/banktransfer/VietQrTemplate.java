package com.diyshop.banktransfer;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum VietQrTemplate {
    COMPACT("compact"),
    COMPACT2("compact2"),
    QR_ONLY("qr_only"),
    PRINT("print");

    private final String imageCode;

    VietQrTemplate(String imageCode) {
        this.imageCode = imageCode;
    }

    /** The API speaks image codes, so JSON round-trips as "compact" rather than "COMPACT". */
    @JsonValue
    public String imageCode() {
        return imageCode;
    }

    @JsonCreator
    public static VietQrTemplate fromImageCode(String imageCode) {
        for (VietQrTemplate template : values()) {
            if (template.imageCode.equals(imageCode)) {
                return template;
            }
        }
        throw new IllegalArgumentException("Unknown VietQR template: " + imageCode);
    }
}
