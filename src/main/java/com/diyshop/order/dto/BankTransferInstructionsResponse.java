package com.diyshop.order.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BankTransferInstructionsResponse(
        String bankName,
        String bankBin,
        String accountNumber,
        String accountName,
        BigDecimal amount,
        String transferContent,
        String qrImageUrl,
        Instant paymentDueAt
) {
}
