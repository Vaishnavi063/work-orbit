package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Schema(description = "Monthly revenue breakdown and analytics for a freelancer")
@Data
@Builder
public class MonthlyRevenueDTO {
    
    @Schema(
        description = "Total revenue earned in the current month",
        example = "3250.00",
        required = true
    )
    private Double currentMonth;
    
    @Schema(
        description = "Total revenue earned in the previous month",
        example = "2875.50",
        required = true
    )
    private Double lastMonth;
    
    @Schema(
        description = "Total revenue earned in the current year",
        example = "15750.50",
        required = true
    )
    private Double currentYear;
    
    @Schema(
        description = "Monthly revenue data points for trend analysis",
        required = true
    )
    private List<MonthlyDataPoint> monthlyData;
}