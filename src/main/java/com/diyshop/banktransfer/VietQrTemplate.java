package com.diyshop.banktransfer;

public enum VietQrTemplate {
    COMPACT("compact"),
    COMPACT2("compact2"),
    QR_ONLY("qr_only"),
    PRINT("print");

    private final String imageCode;

    VietQrTemplate(String imageCode) {
        this.imageCode = imageCode;
    }

    public String imageCode() {
        return imageCode;
    }
}
