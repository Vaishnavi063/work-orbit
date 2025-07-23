package com.workorbit.backend.Wallet.DTO;

import lombok.Data;

@Data
public class WalletRequestDTO {
    private Long userId;
    private String role;
    private Double amount;
}
