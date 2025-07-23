package com.workorbit.backend.Wallet.DTO;

import lombok.*;

import java.util.List;

@Data
@Builder
public class MonthlyRevenueDTO {
    private Double currentMonth;
    private Double lastMonth;
    private Double currentYear;
    private List<MonthlyDataPoint> monthlyData;
}