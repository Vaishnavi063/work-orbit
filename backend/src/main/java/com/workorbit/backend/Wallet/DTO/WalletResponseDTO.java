package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Response DTO containing wallet information and balance details")
public class WalletResponseDTO {
    @Schema(
        description = "Unique identifier of the wallet",
        example = "1"
    )
    private Long walletId;

    @Schema(
        description = "Unique identifier of the user who owns the wallet",
        example = "1"
    )
    private Long userId;

    @Schema(
        description = "Role of the wallet owner",
        example = "CLIENT",
        allowableValues = {"CLIENT", "FREELANCER"}
    )
    private String role;

    @Schema(
        description = "Available balance that can be used for transactions",
        example = "250.75"
    )
    private Double availableBalance;

    @Schema(
        description = "Frozen balance that is temporarily locked for ongoing projects or transactions",
        example = "50.00"
    )
    private Double frozenBalance;
}
