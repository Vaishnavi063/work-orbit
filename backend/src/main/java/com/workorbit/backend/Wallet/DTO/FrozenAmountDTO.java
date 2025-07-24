package com.workorbit.backend.Wallet.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FrozenAmountDTO {
    private Long projectId;
    private String projectTitle;
    private String freelancerName;
    private Double frozenAmount;
    private String status; // FROZEN, RELEASED
}