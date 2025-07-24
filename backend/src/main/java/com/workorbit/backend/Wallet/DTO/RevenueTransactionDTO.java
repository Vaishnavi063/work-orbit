package com.workorbit.backend.Wallet.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
public class RevenueTransactionDTO {
    private Long projectId;
    private String projectTitle;
    private String clientName;
    private Double amount;
    private LocalDateTime receivedAt;
    private String status;
}