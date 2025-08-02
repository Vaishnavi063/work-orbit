package com.workorbit.backend.Wallet.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Response DTO containing Razorpay order details for frontend integration")
public class RazorpayOrderResponse {

    @Schema(
            description = "Razorpay order ID for payment processing",
            example = "order_ABC123XYZ"
    )
    private String orderId;

    @Schema(
            description = "Razorpay API key for frontend integration",
            example = "rzp_test_1234567890"
    )
    private String razorpayKey;

    @Schema(
            description = "Amount to be paid (in rupees)",
            example = "500.00"
    )
    private Double amount;

    @Schema(
            description = "Currency code",
            example = "INR"
    )
    private String currency;

    @Schema(
            description = "Company name to display in checkout",
            example = "WorkOrbit"
    )
    private String companyName;

    @Schema(
            description = "Description for the payment",
            example = "Add money to WorkOrbit wallet"
    )
    private String description;

    @Schema(
            description = "User ID for tracking",
            example = "1"
    )
    private Long userId;
}