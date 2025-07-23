package com.workorbit.backend.Wallet.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class WalletRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role is required")
    private String role;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
