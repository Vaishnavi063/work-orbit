package com.workorbit.backend.Wallet.DTO;

import lombok.Data;

@Data
public class WithdrawRequestDTO {
    private Long userId;
    private Double amount;
}
