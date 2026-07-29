package com.diyshop.dashboard;

import com.diyshop.dashboard.dto.CategoryRevenuePointResponse;
import com.diyshop.dashboard.dto.DashboardStatsResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller/dashboard")
public class SellerDashboardController {

    private final DashboardService dashboardService;

    public SellerDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse getStats() {
        return dashboardService.getStats();
    }

    @GetMapping("/revenue")
    public List<CategoryRevenuePointResponse> getCategoryRevenue(
            @RequestParam(defaultValue = "30") int days
    ) {
        return dashboardService.getCategoryRevenue(days);
    }
}
