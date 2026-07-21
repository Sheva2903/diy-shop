package com.diyshop.order;

import com.diyshop.banktransfer.BankTransferInstructionService;
import com.diyshop.common.exception.BadRequestException;
import com.diyshop.common.exception.ResourceNotFoundException;
import com.diyshop.order.dto.CreateOrderItemRequest;
import com.diyshop.order.dto.CreateOrderRequest;
import com.diyshop.order.dto.OrderResponse;
import com.diyshop.product.Product;
import com.diyshop.product.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private static final DateTimeFormatter ORDER_CODE_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;
    private static final char[] ORDER_CODE_SUFFIX_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int ORDER_CODE_SUFFIX_LENGTH = 6;
    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BankTransferInstructionService bankTransferInstructionService;
    private final BigDecimal flatShippingFee;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Clock clock;

    @Autowired
    public OrderService(
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository,
            BankTransferInstructionService bankTransferInstructionService,
            @Value("${shop.shipping.flat-fee}") BigDecimal flatShippingFee
    ) {
        this(orderRepository, productRepository, bankTransferInstructionService, flatShippingFee, Clock.system(SHOP_ZONE));
    }

    OrderService(
            CustomerOrderRepository orderRepository,
            ProductRepository productRepository,
            BankTransferInstructionService bankTransferInstructionService,
            BigDecimal flatShippingFee,
            Clock clock
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.bankTransferInstructionService = bankTransferInstructionService;
        this.flatShippingFee = flatShippingFee;
        this.clock = clock;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Map<Long, Integer> requestedItems = mergeRequestedItems(request.items());

        CustomerOrder order = new CustomerOrder();
        order.setOrderCode(generateOrderCode());
        order.setRecipientFullName(request.recipientFullName().trim());
        order.setPhoneNumber(request.phoneNumber().trim());
        order.setEmail(request.email().trim());
        order.setProvinceCity(request.provinceCity().trim());
        order.setDistrict(request.district().trim());
        order.setWard(request.ward().trim());
        order.setStreetAddress(request.streetAddress().trim());
        order.setCustomerNote(normalizeOptionalText(request.customerNote()));
        order.setPaymentMethod(request.paymentMethod());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.UNPAID);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> requestedItem : requestedItems.entrySet()) {
            Product product = productRepository.findVisibleProductByIdForUpdate(requestedItem.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            int quantity = requestedItem.getValue();
            if (product.getInventoryQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock for product: " + product.getNameEn());
            }

            product.decreaseInventory(quantity);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setProductNameVi(product.getNameVi());
            item.setProductNameEn(product.getNameEn());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(quantity);
            item.setLineTotal(lineTotal);
            order.addItem(item);
        }

        order.setSubtotal(subtotal);
        order.setShippingFee(flatShippingFee);
        order.setTotalAmount(subtotal.add(flatShippingFee));

        CustomerOrder savedOrder = orderRepository.save(order);

        return OrderResponse.from(savedOrder, bankTransferInstructionService.createFor(savedOrder));
    }

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(String orderCode, String phoneNumber) {
        if (!StringUtils.hasText(orderCode) || !StringUtils.hasText(phoneNumber)) {
            throw new BadRequestException("Order code and phone number are required");
        }

        CustomerOrder order = orderRepository.findByOrderCodeAndPhoneNumberWithItems(
                        orderCode.trim(),
                        phoneNumber.trim()
                )
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return OrderResponse.from(order, bankTransferInstructionService.createFor(order));
    }

    private Map<Long, Integer> mergeRequestedItems(List<CreateOrderItemRequest> items) {
        Map<Long, Integer> mergedItems = new LinkedHashMap<>();

        for (CreateOrderItemRequest item : items) {
            mergedItems.merge(item.productId(), item.quantity(), Integer::sum);
        }

        return mergedItems;
    }

    private String generateOrderCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate = "DS"
                    + LocalDate.now(clock).format(ORDER_CODE_DATE_FORMAT)
                    + "-"
                    + randomSuffix();

            if (!orderRepository.existsByOrderCode(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Could not generate unique order code");
    }

    private String randomSuffix() {
        StringBuilder suffix = new StringBuilder(ORDER_CODE_SUFFIX_LENGTH);

        for (int i = 0; i < ORDER_CODE_SUFFIX_LENGTH; i++) {
            suffix.append(ORDER_CODE_SUFFIX_CHARS[secureRandom.nextInt(ORDER_CODE_SUFFIX_CHARS.length)]);
        }

        return suffix.toString();
    }

    private String normalizeOptionalText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
