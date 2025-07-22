package com.workorbit.backend.Chat.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for bid details in chat context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidDetailsResponse {
    
    private Long bidId;
    private Long projectId;
    private String projectTitle;
    private Long freelancerId;
    private String freelancerName;
    private String proposal;
    private BigDecimal bidAmount;
    private Integer durationDays;
    private Integer teamSize;
    private String status;
    private LocalDateTime createdAt;
    private boolean canAccept;
    private boolean canReject;
}