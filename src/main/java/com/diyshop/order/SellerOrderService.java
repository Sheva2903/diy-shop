package com.diyshop.order;

import com.diyshop.common.exception.BadRequestException;
import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.order.dto.OrderResponse;
import com.diyshop.order.dto.SellerOrderListResponse;
import com.diyshop.product.Product;
import com.diyshop.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SellerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;

    public SellerOrderService(
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<SellerOrderListResponse> getOrders() {
        return orderRepository.findAllForSellerOrderByActiveFirst().stream()
                .map(SellerOrderListResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderCode) {
        return OrderResponse.from(getOrderWithItems(orderCode));
    }

    @Transactional
    public OrderResponse markPaymentPaid(String orderCode) {
        CustomerOrder order = getOrderWithItems(orderCode);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cancelled orders cannot be marked paid");
        }

        if (order.getPaymentStatus() == PaymentStatus.FAILED) {
            throw new BadRequestException("Failed payments cannot be marked paid");
        }

        order.markPaid();

        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderCode, OrderStatus nextStatus) {
        CustomerOrder order = getOrderWithItems(orderCode);

        validateTransition(order.getOrderStatus(), nextStatus);

        if (nextStatus == OrderStatus.CANCELLED) {
            restoreInventory(order);
        }

        order.changeOrderStatus(nextStatus);

        return OrderResponse.from(order);
    }

    private CustomerOrder getOrderWithItems(String orderCode) {
        return orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private void validateTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == nextStatus) {
            throw new BadRequestException("Order already has status: " + nextStatus);
        }

        boolean allowed = switch (currentStatus) {
            case PENDING -> nextStatus == OrderStatus.CONFIRMED || nextStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> nextStatus == OrderStatus.SHIPPING || nextStatus == OrderStatus.CANCELLED;
            case SHIPPING -> nextStatus == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new BadRequestException("Invalid order status transition: " + currentStatus + " -> " + nextStatus);
        }
    }

    private void restoreInventory(CustomerOrder order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            product.increaseInventory(item.getQuantity());
        }
    }
}
