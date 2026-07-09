package com.diyshop.order.dto;

import com.diyshop.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 150) String recipientFullName,
        @NotBlank @Size(max = 30) String phoneNumber,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 100) String provinceCity,
        @NotBlank @Size(max = 100) String district,
        @NotBlank @Size(max = 100) String ward,
        @NotBlank @Size(max = 255) String streetAddress,
        @Size(max = 2000) String customerNote,
        @NotNull PaymentMethod paymentMethod,
        @NotEmpty List<@Valid CreateOrderItemRequest> items
) {
}
