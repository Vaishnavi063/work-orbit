package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Schema(description = "Revenue transaction details for a specific project payment")
@Data
@Builder
public class RevenueTransactionDTO {
    
    @Schema(
        description = "Unique identifier of the project associated with this transaction",
        example = "101",
        required = true
    )
    private Long projectId;
    
    @Schema(
        description = "Title of the project for which payment was received",
        example = "E-commerce Website Development",
        required = true
    )
    private String projectTitle;
    
    @Schema(
        description = "Name of the client who made the payment",
        example = "Tech Solutions Inc.",
        required = true
    )
    private String clientName;
    
    @Schema(
        description = "Amount received for this transaction",
        example = "1250.00",
        required = true
    )
    private Double amount;
    
    @Schema(
        description = "Date and time when the payment was received",
        example = "2024-01-15T14:30:00",
        required = true
    )
    private LocalDateTime receivedAt;
    
    @Schema(
        description = "Current status of the transaction",
        example = "COMPLETED",
        allowableValues = {"PENDING", "COMPLETED", "FAILED", "REFUNDED"},
        required = true
    )
    private String status;
}