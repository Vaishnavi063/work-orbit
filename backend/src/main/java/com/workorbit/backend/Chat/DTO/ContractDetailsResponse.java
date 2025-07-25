package com.workorbit.backend.Chat.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for contract details in chat context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractDetailsResponse {
    
    private Long contractId;
    private Long projectId;
    private String projectTitle;
    private Long bidId;
    private Long clientId;
    private String clientName;
    private Long freelancerId;
    private String freelancerName;
    private BigDecimal contractAmount;
    private Integer durationDays;
    private String contractStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}