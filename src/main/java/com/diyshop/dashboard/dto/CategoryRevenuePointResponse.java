package com.diyshop.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Revenue for one category on one day. */
public record CategoryRevenuePointResponse(
        LocalDate date,
        Long categoryId,
        String categoryNameVi,
        String categoryNameEn,
        BigDecimal revenue
) {
}
