package com.workorbit.backend.Wallet.DTO;

import lombok.*;

import java.util.List;

@Data
@Builder
public class FreelancerRevenueDTO {
    private Long freelancerId;
    private String freelancerName;
    private Double totalEarnings;
    private Double currentBalance;
    private Double totalWithdrawn;
    private Integer completedProjects;
    private List<RevenueTransactionDTO> recentTransactions;
    private MonthlyRevenueDTO monthlyBreakdown;
}