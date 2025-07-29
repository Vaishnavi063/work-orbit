package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Schema(description = "Comprehensive revenue information for a freelancer")
@Data
@Builder
public class FreelancerRevenueDTO {
    
    @Schema(
        description = "Unique identifier of the freelancer",
        example = "1",
        required = true
    )
    private Long freelancerId;
    
    @Schema(
        description = "Full name of the freelancer",
        example = "John Doe",
        required = true
    )
    private String freelancerName;
    
    @Schema(
        description = "Total amount earned by the freelancer across all completed projects",
        example = "15750.50",
        required = true
    )
    private Double totalEarnings;
    
    @Schema(
        description = "Current available balance in the freelancer's wallet",
        example = "2500.75",
        required = true
    )
    private Double currentBalance;
    
    @Schema(
        description = "Total amount withdrawn by the freelancer from their wallet",
        example = "13249.75",
        required = true
    )
    private Double totalWithdrawn;
    
    @Schema(
        description = "Number of projects completed by the freelancer",
        example = "12",
        required = true
    )
    private Integer completedProjects;
    
    @Schema(
        description = "List of recent revenue transactions for the freelancer",
        required = true
    )
    private List<RevenueTransactionDTO> recentTransactions;
    
    @Schema(
        description = "Monthly revenue breakdown and analytics",
        required = true
    )
    private MonthlyRevenueDTO monthlyBreakdown;
}