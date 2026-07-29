package com.diyshop.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
        long ordersToday,
        long ordersYesterday,
        BigDecimal revenue7Days,
        BigDecimal revenuePrevious7Days,
        long activeProducts,
        long pendingOrders,
        List<LowStockProductResponse> lowStock
) {
    public record LowStockProductResponse(
            Long id,
            String nameVi,
            String nameEn,
            int inventoryQuantity,
            String imageUrl
    ) {
    }
}
