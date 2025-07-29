package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Request DTO for wallet operations including money addition and wallet creation")
public class WalletRequestDTO {
    @Schema(
        description = "Unique identifier of the user who owns the wallet",
        example = "1",
        required = true
    )
    @NotNull(message = "User ID is required")
    private Long userId;

    @Schema(
        description = "Role of the user (CLIENT or FREELANCER)",
        example = "CLIENT",
        required = true,
        allowableValues = {"CLIENT", "FREELANCER"}
    )
    @NotBlank(message = "Role is required")
    private String role;

    @Schema(
        description = "Amount of money to add to the wallet (must be positive)",
        example = "100.50",
        required = true,
        minimum = "0.01"
    )
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
