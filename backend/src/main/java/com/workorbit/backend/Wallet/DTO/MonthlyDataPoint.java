package com.workorbit.backend.Wallet.DTO;

import lombok.*;

@Data
@Builder
public class MonthlyDataPoint {
    private String month;
    private Double earnings;
    private Integer projects;
}