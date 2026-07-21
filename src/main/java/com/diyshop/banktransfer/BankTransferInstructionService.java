package com.diyshop.banktransfer;

import com.diyshop.order.CustomerOrder;
import com.diyshop.order.PaymentMethod;
import com.diyshop.order.dto.BankTransferInstructionsResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class BankTransferInstructionService {

    private static final int MAX_TRANSFER_CONTENT_LENGTH = 25;

    private final BankTransferProperties properties;

    public BankTransferInstructionService(BankTransferProperties properties) {
        this.properties = properties;
    }

    public BankTransferInstructionsResponse createFor(CustomerOrder order) {
        if (order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            return null;
        }

        String transferContent = createTransferContent(order.getOrderCode());
        BigDecimal amount = order.getTotalAmount();

        return new BankTransferInstructionsResponse(
                properties.getBankName(),
                properties.getBankBin(),
                properties.getAccountNumber(),
                properties.getAccountName(),
                amount,
                transferContent,
                createQrImageUrl(amount, transferContent),
                paymentDueAt(order.getCreatedAt())
        );
    }

    String createTransferContent(String orderCode) {
        String sanitized = orderCode.replaceAll("[^A-Za-z0-9]", "")
                .toUpperCase(Locale.ROOT);

        if (sanitized.isBlank()) {
            throw new IllegalStateException("Order code cannot produce a bank transfer reference");
        }

        if (sanitized.length() > MAX_TRANSFER_CONTENT_LENGTH) {
            return sanitized.substring(0, MAX_TRANSFER_CONTENT_LENGTH);
        }

        return sanitized;
    }

    private String createQrImageUrl(BigDecimal amount, String transferContent) {
        String baseUrl = "https://img.vietqr.io/image/"
                + properties.getBankCode()
                + "-"
                + properties.getAccountNumber()
                + "-"
                + properties.getTemplate().imageCode()
                + ".jpg";

        return UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("amount", toWholeVnd(amount))
                .queryParam("addInfo", transferContent)
                .queryParam("accountName", properties.getAccountName())
                .build()
                .encode()
                .toUriString();
    }

    private String toWholeVnd(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.UNNECESSARY).toPlainString();
    }

    private Instant paymentDueAt(Instant createdAt) {
        return createdAt.plus(Duration.ofHours(properties.getPaymentDueHours()));
    }
}
