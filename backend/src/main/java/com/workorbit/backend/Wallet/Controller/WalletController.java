package com.workorbit.backend.Wallet.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Wallet.DTO.FrozenAmountDTO;
import com.workorbit.backend.Wallet.DTO.WalletRequestDTO;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.DTO.WithdrawRequestDTO;
import com.workorbit.backend.Wallet.Service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/add-money")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> addMoney(@RequestBody WalletRequestDTO request) {
        WalletResponseDTO response = walletService.addMoney(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> getWallet(
            @PathVariable Long userId,
            @RequestParam String role
    ) {
        WalletResponseDTO response = walletService.getWallet(userId, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WalletResponseDTO>> withdraw(@RequestBody WithdrawRequestDTO request) {
        WalletResponseDTO response = walletService.withdraw(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/freeze")
    public ResponseEntity<ApiResponse<String>> freezeAmount(
            @RequestParam Long userId,
            @RequestParam Long projectId,
            @RequestParam Double amount
    ) {
        walletService.freezeAmount(userId, projectId, amount);
        return ResponseEntity.ok(ApiResponse.success("Amount frozen successfully."));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<String>> releasePayment(
            @RequestParam Long clientId,
            @RequestParam Long freelancerId,
            @RequestParam Long projectId,
            @RequestParam Double amount
    ) {
        walletService.releasePayment(clientId, freelancerId, projectId, amount);
        return ResponseEntity.ok(ApiResponse.success("Payment released successfully."));
    }

    @GetMapping("/frozen-amounts/{clientId}")
    public ResponseEntity<ApiResponse<List<FrozenAmountDTO>>> getClientFrozenAmounts(
            @PathVariable Long clientId
    ) {
        List<FrozenAmountDTO> frozenAmounts = walletService.getClientFrozenAmounts(clientId);
        return ResponseEntity.ok(ApiResponse.success(frozenAmounts));
    }
}