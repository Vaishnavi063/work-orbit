package com.workorbit.backend.Wallet.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Wallet.DTO.FrozenAmountDTO;
import com.workorbit.backend.Wallet.DTO.WalletRequestDTO;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.DTO.WithdrawRequestDTO;
import com.workorbit.backend.Wallet.Service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Wallet Management", description = "Wallet operations including balance management, money transfers, and payment processing")
@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @Operation(
        summary = "Create new wallet",
        description = "Create a new wallet for a user with specified role (CLIENT or FREELANCER)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Wallet created successfully - returns wallet details with initial balance"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - missing or invalid parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "Conflict - wallet already exists for this user and role"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - wallet creation failed"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> createWallet(
            @Parameter(description = "User ID for whom to create the wallet", required = true, example = "1")
            @RequestParam Long userId,
            @Parameter(description = "User role - must be either CLIENT or FREELANCER", required = true, example = "CLIENT")
            @RequestParam String role
    ) {
        WalletResponseDTO response = walletService.createWallet(userId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "Add money to wallet",
        description = "Add funds to a user's wallet - typically used by clients to fund their accounts"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Money added successfully - returns updated wallet balance"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - validation errors or negative amount"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Wallet not found for the specified user and role"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - transaction failed"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/add-money")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> addMoney(
            @Parameter(description = "Wallet funding request containing user ID, role, and amount")
            @Valid @RequestBody WalletRequestDTO request) {
        WalletResponseDTO response = walletService.addMoney(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "Get wallet details",
        description = "Retrieve wallet information including available and frozen balances for a specific user and role"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Wallet details retrieved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - missing or invalid parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Wallet not found for the specified user and role"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403", 
            description = "Access denied - insufficient permissions to view wallet"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> getWallet(
            @Parameter(description = "User ID whose wallet to retrieve", required = true, example = "1")
            @PathVariable Long userId,
            @Parameter(description = "User role - CLIENT or FREELANCER", required = true, example = "CLIENT")
            @RequestParam String role
    ) {
        WalletResponseDTO response = walletService.getWallet(userId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "Withdraw money from wallet",
        description = "Withdraw funds from a user's wallet - typically used by freelancers to cash out earnings"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Withdrawal successful - returns updated wallet balance"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - validation errors, insufficient funds, or negative amount"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Wallet not found for the specified user"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422", 
            description = "Insufficient balance - withdrawal amount exceeds available funds"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - withdrawal transaction failed"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> withdraw(
            @Parameter(description = "Withdrawal request containing user ID and amount to withdraw")
            @Valid @RequestBody WithdrawRequestDTO request) {
        WalletResponseDTO response = walletService.withdraw(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
        summary = "Freeze amount in wallet",
        description = "Freeze a specific amount in client's wallet for a project - ensures funds are reserved for payment upon project completion"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Amount frozen successfully - funds reserved for project"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - missing parameters, negative amount, or validation errors"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Wallet or project not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422", 
            description = "Insufficient balance - cannot freeze more than available funds"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - freeze operation failed"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/freeze")
    public ResponseEntity<ApiResponse<String>> freezeAmount(
            @Parameter(description = "Client user ID whose funds to freeze", required = true, example = "1")
            @RequestParam Long userId,
            @Parameter(description = "Project ID for which to freeze the funds", required = true, example = "10")
            @RequestParam Long projectId,
            @Parameter(description = "Amount to freeze (must be positive)", required = true, example = "500.00")
            @RequestParam Double amount
    ) {
        walletService.freezeAmount(userId, projectId, amount);
        return ResponseEntity.ok(ApiResponse.success("Amount frozen successfully."));
    }

    @Operation(
        summary = "Release frozen payment",
        description = "Release frozen funds from client's wallet to freelancer's wallet upon project completion - transfers money from frozen balance to freelancer's available balance"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Payment released successfully - funds transferred to freelancer"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - missing parameters, negative amount, or validation errors"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Client wallet, freelancer wallet, or project not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422", 
            description = "Insufficient frozen funds - cannot release more than frozen amount for this project"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - payment release transaction failed"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<String>> releasePayment(
            @Parameter(description = "Client user ID from whose wallet to release funds", required = true, example = "1")
            @RequestParam Long clientId,
            @Parameter(description = "Freelancer user ID to receive the released funds", required = true, example = "2")
            @RequestParam Long freelancerId,
            @Parameter(description = "Project ID for which to release the payment", required = true, example = "10")
            @RequestParam Long projectId,
            @Parameter(description = "Amount to release (must match frozen amount)", required = true, example = "500.00")
            @RequestParam Double amount
    ) {
        walletService.releasePayment(clientId, freelancerId, projectId, amount);
        return ResponseEntity.ok(ApiResponse.success("Payment released successfully."));
    }

    @Operation(
        summary = "Get client's frozen amounts",
        description = "Retrieve all frozen amounts for a specific client, showing project details and frozen fund status"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Frozen amounts retrieved successfully - returns list of all frozen funds with project details"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - invalid client ID format"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Client not found or no frozen amounts exist"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403", 
            description = "Access denied - insufficient permissions to view client's frozen amounts"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/frozen-amounts/{clientId}")
    public ResponseEntity<ApiResponse<List<FrozenAmountDTO>>> getClientFrozenAmounts(
            @Parameter(description = "Client user ID whose frozen amounts to retrieve", required = true, example = "1")
            @PathVariable Long clientId
    ) {
        List<FrozenAmountDTO> frozenAmounts = walletService.getClientFrozenAmounts(clientId);
        return ResponseEntity.ok(ApiResponse.success(frozenAmounts));
    }
}