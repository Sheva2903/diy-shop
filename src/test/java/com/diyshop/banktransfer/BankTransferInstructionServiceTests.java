package com.diyshop.banktransfer;

import com.diyshop.order.CustomerOrder;
import com.diyshop.order.PaymentMethod;
import com.diyshop.order.dto.BankTransferInstructionsResponse;
import com.diyshop.settings.ShopSettings;
import com.diyshop.settings.ShopSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BankTransferInstructionServiceTests {

    @Test
    void returnsNullForCashOnDeliveryOrders() {
        BankTransferInstructionService service = new BankTransferInstructionService(settingsService());
        CustomerOrder order = order(PaymentMethod.COD);

        assertNull(service.createFor(order));
    }

    @Test
    void createsDeterministicInstructionsForBankTransferOrders() {
        BankTransferInstructionService service = new BankTransferInstructionService(settingsService());
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
        BankTransferInstructionService service = new BankTransferInstructionService(settingsService());

        assertEquals("DS20260721ABC123", service.createTransferContent("ds20260721-abc123"));
        assertEquals("ORDERWITHVERYLONGREFERENC", service.createTransferContent("ORDER-WITH-VERY-LONG-REFERENCE-123456"));
    }

    private CustomerOrder order(PaymentMethod paymentMethod) {
        CustomerOrder order = new CustomerOrder();
        order.setOrderCode("DS20260721-ABC123");
        order.setPaymentMethod(paymentMethod);
        order.setTotalAmount(new BigDecimal("250000.00"));
        ReflectionTestUtils.setField(order, "createdAt", Instant.parse("2026-07-20T08:30:00Z"));
        return order;
    }

    private ShopSettingsService settingsService() {
        ShopSettings settings = new ShopSettings();
        settings.setBankName("Vietcombank");
        settings.setBankCode("vietcombank");
        settings.setBankBin("970436");
        settings.setAccountNumber("123456789");
        settings.setAccountName("DIY SHOP");
        settings.setVietqrTemplate(VietQrTemplate.COMPACT);
        settings.setPaymentDueHours(24);

        ShopSettingsService shopSettingsService = mock(ShopSettingsService.class);
        when(shopSettingsService.getSettings()).thenReturn(settings);
        return shopSettingsService;
    }
}
