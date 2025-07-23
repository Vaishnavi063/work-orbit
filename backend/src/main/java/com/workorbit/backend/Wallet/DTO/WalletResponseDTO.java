package com.workorbit.backend.Wallet.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletResponseDTO {
    private Long walletId;
    private Long userId;
    private String role;
    private Double availableBalance;
    private Double frozenBalance;
}
