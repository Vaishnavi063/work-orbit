package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO representing frozen amount details for a specific project transaction")
public class FrozenAmountDTO {
    @Schema(
        description = "Unique identifier of the project associated with the frozen amount",
        example = "1"
    )
    private Long projectId;

    @Schema(
        description = "Title of the project for which the amount is frozen",
        example = "E-commerce Website Development"
    )
    private String projectTitle;

    @Schema(
        description = "Name of the freelancer working on the project",
        example = "John Doe"
    )
    private String freelancerName;

    @Schema(
        description = "Amount of money frozen for this project transaction",
        example = "500.00"
    )
    private Double frozenAmount;

    @Schema(
        description = "Current status of the frozen amount",
        example = "FROZEN",
        allowableValues = {"FROZEN", "RELEASED"}
    )
    private String status; // FROZEN, RELEASED
}