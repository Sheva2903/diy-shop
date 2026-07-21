package com.diyshop.banktransfer;

import com.diyshop.order.CustomerOrder;
import com.diyshop.order.PaymentMethod;
import com.diyshop.order.dto.BankTransferInstructionsResponse;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.validation.autoconfigure.ValidationAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class BankTransferInstructionServiceTests {

    @Test
    void returnsNullForCashOnDeliveryOrders() {
        BankTransferInstructionService service = new BankTransferInstructionService(validProperties());
        CustomerOrder order = order(PaymentMethod.COD);

        assertNull(service.createFor(order));
    }

    @Test
    void createsDeterministicInstructionsForBankTransferOrders() {
        BankTransferInstructionService service = new BankTransferInstructionService(validProperties());
        CustomerOrder order = order(PaymentMethod.BANK_TRANSFER);

        BankTransferInstructionsResponse instructions = service.createFor(order);

        assertEquals("Vietcombank", instructions.bankName());
        assertEquals("970436", instructions.bankBin());
        assertEquals("123456789", instructions.accountNumber());
        assertEquals("DIY SHOP", instructions.accountName());
        assertEquals(new BigDecimal("250000.00"), instructions.amount());
        assertEquals("DS20260721ABC123", instructions.transferContent());
        assertEquals(
                "https://img.vietqr.io/image/vietcombank-123456789-compact.jpg"
                        + "?amount=250000&addInfo=DS20260721ABC123&accountName=DIY%20SHOP",
                instructions.qrImageUrl()
        );
        assertEquals(Instant.parse("2026-07-21T08:30:00Z"), instructions.paymentDueAt());
    }

    @Test
    void sanitizesTransferContentForVietQrConstraints() {
        BankTransferInstructionService service = new BankTransferInstructionService(validProperties());

        assertEquals("DS20260721ABC123", service.createTransferContent("ds20260721-abc123"));
        assertEquals("ORDERWITHVERYLONGREFERENC", service.createTransferContent("ORDER-WITH-VERY-LONG-REFERENCE-123456"));
    }

    @Test
    void validatesRequiredConfiguration() {
        BankTransferProperties properties = validProperties();
        properties.setAccountNumber("abc");

        try (ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(validatorFactory.getValidator().validate(properties).isEmpty());
        }
    }

    @Test
    void failsApplicationStartupWhenRequiredConfigurationIsMissing() {
        new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ValidationAutoConfiguration.class))
                .withUserConfiguration(BankTransferConfiguration.class)
                .run(context -> assertNotNull(context.getStartupFailure()));
    }

    private CustomerOrder order(PaymentMethod paymentMethod) {
        CustomerOrder order = new CustomerOrder();
        order.setOrderCode("DS20260721-ABC123");
        order.setPaymentMethod(paymentMethod);
        order.setTotalAmount(new BigDecimal("250000.00"));
        ReflectionTestUtils.setField(order, "createdAt", Instant.parse("2026-07-20T08:30:00Z"));
        return order;
    }

    private BankTransferProperties validProperties() {
        BankTransferProperties properties = new BankTransferProperties();
        properties.setBankName("Vietcombank");
        properties.setBankCode("vietcombank");
        properties.setBankBin("970436");
        properties.setAccountNumber("123456789");
        properties.setAccountName("DIY SHOP");
        properties.setTemplate(VietQrTemplate.COMPACT);
        properties.setPaymentDueHours(24);
        return properties;
    }
}
