package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "Monthly data point containing earnings and project statistics")
@Data
@Builder
public class MonthlyDataPoint {
    
    @Schema(
        description = "Month identifier in YYYY-MM format",
        example = "2024-01",
        required = true
    )
    private String month;
    
    @Schema(
        description = "Total earnings for the specified month",
        example = "2875.50",
        required = true
    )
    private Double earnings;
    
    @Schema(
        description = "Number of projects completed in the specified month",
        example = "3",
        required = true
    )
    private Integer projects;
}