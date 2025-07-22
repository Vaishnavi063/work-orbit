package com.workorbit.backend.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BidResponseDTO {
    private Long bidId;
    private Long freelancerId;
    private ProjectDTO project;
    private String freelancerName;
    private String proposal;
    private Double bidAmount;
    private Long durationDays;
    private Integer teamSize;
    private String status;
    private LocalDateTime createdAt;
}