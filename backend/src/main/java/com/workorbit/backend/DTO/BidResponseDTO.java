package com.workorbit.backend.DTO;

import lombok.*;

import java.time.LocalDateTime;
@Setter
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidResponseDTO {
    private Long bidId;
    private Long freelancerId;
    private Long projectId;
    private String proposal;
    private Double bidAmount;
    private Long durationDays;
    private String status;
    private LocalDateTime createdAt;
}