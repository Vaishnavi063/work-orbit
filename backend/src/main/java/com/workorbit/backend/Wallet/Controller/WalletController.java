package com.workorbit.backend.Wallet.Controller;

import com.workorbit.backend.Wallet.DTO.WalletRequestDTO;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.DTO.WithdrawRequestDTO;
import com.workorbit.backend.Wallet.Service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/add-money")
    public ResponseEntity<WalletResponseDTO> addMoney(@RequestBody WalletRequestDTO request) {
        WalletResponseDTO response = walletService.addMoney(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WalletResponseDTO> getWallet(
            @PathVariable Long userId,
            @RequestParam String role
    ) {
        WalletResponseDTO response = walletService.getWallet(userId, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletResponseDTO> withdraw(@RequestBody WithdrawRequestDTO request) {
        WalletResponseDTO response = walletService.withdraw(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/freeze")
    public ResponseEntity<String> freezeAmount(
            @RequestParam Long userId,
            @RequestParam Double amount
    ) {
        walletService.freezeAmount(userId, amount);
        return ResponseEntity.ok("Amount frozen successfully.");
    }

    @PostMapping("/release")
    public ResponseEntity<String> releasePayment(
            @RequestParam Long clientId,
            @RequestParam Long freelancerId,
            @RequestParam Double amount
    ) {
        walletService.releasePayment(clientId, freelancerId, amount);
        return ResponseEntity.ok("Payment released successfully.");
    }
}
