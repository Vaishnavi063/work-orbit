package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Request DTO for verifying Razorpay payment and adding money to wallet")
public class VerifyPaymentRequest {

    @Schema(
            description = "Razorpay order ID received from order creation",
            example = "order_ABC123XYZ",
            required = true
    )
    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @Schema(
            description = "Razorpay payment ID received after successful payment",
            example = "pay_XYZ789ABC",
            required = true
    )
    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    @Schema(
            description = "Razorpay signature for payment verification",
            example = "signature_hash_string",
            required = true
    )
    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;

    @Schema(
            description = "User ID who made the payment",
            example = "1",
            required = true
    )
    @NotNull(message = "User ID is required")
    private Long userId;

    @Schema(
            description = "User role",
            example = "CLIENT",
            required = true
    )
    @NotBlank(message = "User role is required")
    private String role;

    @Schema(
            description = "Amount that was paid",
            example = "500.00",
            required = true
    )
    @NotNull(message = "Amount is required")
    private Double amount;
}