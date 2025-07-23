package com.workorbit.backend.Wallet.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class WithdrawRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
