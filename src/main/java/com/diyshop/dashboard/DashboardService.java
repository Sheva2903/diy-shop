package com.diyshop.dashboard;

import com.diyshop.common.exception.BadRequestException;
import com.diyshop.dashboard.dto.CategoryRevenuePointResponse;
import com.diyshop.dashboard.dto.DashboardStatsResponse;
import com.diyshop.product.Product;
import com.diyshop.product.ProductImage;
import com.diyshop.product.ProductImageResponseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final int LOW_STOCK_LIMIT = 10;
    private static final int MAX_REVENUE_DAYS = 365;

    private final DashboardRepository dashboardRepository;
    private final ProductImageResponseMapper imageResponseMapper;
    private final Clock clock;

    @Autowired
    public DashboardService(
            DashboardRepository dashboardRepository,
            ProductImageResponseMapper imageResponseMapper
    ) {
        this(dashboardRepository, imageResponseMapper, Clock.system(SHOP_ZONE));
    }

    DashboardService(
            DashboardRepository dashboardRepository,
            ProductImageResponseMapper imageResponseMapper,
            Clock clock
    ) {
        this.dashboardRepository = dashboardRepository;
        this.imageResponseMapper = imageResponseMapper;
        this.clock = clock;
    }

    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now(clock);
        Instant startOfToday = startOfDay(today);
        Instant startOfTomorrow = startOfDay(today.plusDays(1));
        Instant startOfYesterday = startOfDay(today.minusDays(1));

        Instant now = clock.instant();
        Instant sevenDaysAgo = now.minus(Duration.ofDays(7));
        Instant fourteenDaysAgo = now.minus(Duration.ofDays(14));

        return new DashboardStatsResponse(
                dashboardRepository.countOrdersCreatedBetween(startOfToday, startOfTomorrow),
                dashboardRepository.countOrdersCreatedBetween(startOfYesterday, startOfToday),
                dashboardRepository.sumRevenueBetween(sevenDaysAgo, now),
                dashboardRepository.sumRevenueBetween(fourteenDaysAgo, sevenDaysAgo),
                dashboardRepository.countActiveProducts(),
                dashboardRepository.countPendingOrders(),
                lowStock()
        );
    }

    public List<CategoryRevenuePointResponse> getCategoryRevenue(int days) {
        if (days < 1 || days > MAX_REVENUE_DAYS) {
            throw new BadRequestException("days must be between 1 and " + MAX_REVENUE_DAYS);
        }

        Instant from = startOfDay(LocalDate.now(clock).minusDays(days - 1L));

        return dashboardRepository.findCategoryRevenueSince(from).stream()
                .map(row -> new CategoryRevenuePointResponse(
                        ((Date) row[0]).toLocalDate(),
                        (Long) row[1],
                        (String) row[2],
                        (String) row[3],
                        (BigDecimal) row[4]
                ))
                .toList();
    }

    private List<DashboardStatsResponse.LowStockProductResponse> lowStock() {
        return dashboardRepository
                .findLowStockProducts(LOW_STOCK_THRESHOLD, PageRequest.of(0, LOW_STOCK_LIMIT))
                .stream()
                .map(product -> new DashboardStatsResponse.LowStockProductResponse(
                        product.getId(),
                        product.getNameVi(),
                        product.getNameEn(),
                        product.getInventoryQuantity(),
                        primaryImageUrl(product)
                ))
                .toList();
    }

    private String primaryImageUrl(Product product) {
        return product.getImages().stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(imageResponseMapper::resolveUrl)
                .orElse(null);
    }

    private Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(SHOP_ZONE).toInstant();
    }
}
