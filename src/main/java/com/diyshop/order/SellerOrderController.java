package com.diyshop.order;

import com.diyshop.order.dto.OrderResponse;
import com.diyshop.order.dto.SellerOrderListResponse;
import com.diyshop.order.dto.UpdateOrderStatusRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller/orders")
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;

    public SellerOrderController(SellerOrderService sellerOrderService) {
        this.sellerOrderService = sellerOrderService;
    }

    @GetMapping
    public List<SellerOrderListResponse> getOrders() {
        return sellerOrderService.getOrders();
    }

    @GetMapping("/{orderCode}")
    public OrderResponse getOrder(@PathVariable String orderCode) {
        return sellerOrderService.getOrder(orderCode);
    }

    @PatchMapping("/{orderCode}/payment")
    public OrderResponse markPaymentPaid(@PathVariable String orderCode) {
        return sellerOrderService.markPaymentPaid(orderCode);
    }

    @PatchMapping("/{orderCode}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable String orderCode,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return sellerOrderService.updateOrderStatus(orderCode, request.orderStatus());
    }
}
