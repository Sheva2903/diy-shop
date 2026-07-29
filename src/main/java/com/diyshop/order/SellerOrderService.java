package com.diyshop.order;

import com.diyshop.banktransfer.BankTransferInstructionService;
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
    private final BankTransferInstructionService bankTransferInstructionService;

    public SellerOrderService(
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository,
            BankTransferInstructionService bankTransferInstructionService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.bankTransferInstructionService = bankTransferInstructionService;
    }

    @Transactional(readOnly = true)
    public List<SellerOrderListResponse> getOrders() {
        return orderRepository.findAllForSellerOrderByActiveFirst().stream()
                .map(SellerOrderListResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderCode) {
        CustomerOrder order = getOrderWithItems(orderCode);
        return OrderResponse.from(order, bankTransferInstructionService.createFor(order));
    }

    @Transactional
    public OrderResponse updatePaymentStatus(String orderCode, PaymentStatus nextStatus) {
        CustomerOrder order = getOrderWithItems(orderCode);

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cancelled orders cannot have their payment status changed");
        }

        if (nextStatus == PaymentStatus.PAID && order.getPaymentStatus() == PaymentStatus.FAILED) {
            throw new BadRequestException("Failed payments cannot be marked paid");
        }

        order.setPaymentStatus(nextStatus);

        return OrderResponse.from(order, bankTransferInstructionService.createFor(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderCode, OrderStatus nextStatus, String cancellationReason) {
        CustomerOrder order = getOrderWithItems(orderCode);

        validateTransition(order.getOrderStatus(), nextStatus);

        if (nextStatus == OrderStatus.CANCELLED) {
            restoreInventory(order);
            order.setCancellationReason(cancellationReason);
        }

        order.changeOrderStatus(nextStatus);

        return OrderResponse.from(order, bankTransferInstructionService.createFor(order));
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
