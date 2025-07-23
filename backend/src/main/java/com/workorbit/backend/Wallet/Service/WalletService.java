package com.workorbit.backend.Wallet.Service;

import com.workorbit.backend.Wallet.DTO.WalletRequestDTO;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.DTO.WithdrawRequestDTO;
import com.workorbit.backend.Wallet.Entity.Wallet;
import com.workorbit.backend.Wallet.Repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    private String normalizeRole(String role) {
        if (role.equalsIgnoreCase("ROLE_CLIENT")) return "CLIENT";
        if (role.equalsIgnoreCase("ROLE_FREELANCER")) return "FREELANCER";
        return role.toUpperCase();
    }

    public WalletResponseDTO addMoney(WalletRequestDTO request) {
        String normalizedRole = normalizeRole(request.getRole());

        Wallet wallet = walletRepository.findByUserIdAndRole(request.getUserId(), normalizedRole)
                .orElse(Wallet.builder()
                        .userId(request.getUserId())
                        .role(normalizedRole)
                        .availableBalance(0.0)
                        .frozenBalance(0.0)
                        .build()
                );

        Double available = wallet.getAvailableBalance() != null ? wallet.getAvailableBalance() : 0.0;
        wallet.setAvailableBalance(available + request.getAmount());
        walletRepository.save(wallet);

        return toResponse(wallet);
    }

    public WalletResponseDTO getWallet(Long userId, String role) {
        String normalizedRole = normalizeRole(role);

        Wallet wallet = walletRepository.findByUserIdAndRole(userId, normalizedRole)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        return toResponse(wallet);
    }

    public WalletResponseDTO withdraw(WithdrawRequestDTO request) {
        Wallet wallet = walletRepository.findByUserIdAndRole(request.getUserId(), "FREELANCER")
                .orElseThrow(() -> new RuntimeException("Freelancer wallet not found"));

        Double available = wallet.getAvailableBalance() != null ? wallet.getAvailableBalance() : 0.0;
        if (available < request.getAmount()) {
            throw new RuntimeException("Insufficient balance for withdrawal.");
        }

        wallet.setAvailableBalance(available - request.getAmount());
        walletRepository.save(wallet);

        return toResponse(wallet);
    }

    public void freezeAmount(Long clientId, Double amount) {
        Wallet wallet = walletRepository.findByUserIdAndRole(clientId, "CLIENT")
                .orElseThrow(() -> new RuntimeException("Client wallet not found"));

        Double available = wallet.getAvailableBalance() != null ? wallet.getAvailableBalance() : 0.0;
        Double frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0.0;

        if (available < amount) {
            throw new RuntimeException("Insufficient funds to accept this bid.");
        }

        wallet.setAvailableBalance(available - amount);
        wallet.setFrozenBalance(frozen + amount);
        walletRepository.save(wallet);
    }

    public void releasePayment(Long clientId, Long freelancerId, Double amount) {
        // Deduct frozen from client
        Wallet clientWallet = walletRepository.findByUserIdAndRole(clientId, "CLIENT")
                .orElseThrow(() -> new RuntimeException("Client wallet not found"));

        Double frozen = clientWallet.getFrozenBalance() != null ? clientWallet.getFrozenBalance() : 0.0;
        if (frozen < amount) {
            throw new RuntimeException("Insufficient frozen funds to release payment.");
        }

        clientWallet.setFrozenBalance(frozen - amount);
        walletRepository.save(clientWallet);

        // Credit to freelancer
        Wallet freelancerWallet = walletRepository.findByUserIdAndRole(freelancerId, "FREELANCER")
                .orElse(Wallet.builder()
                        .userId(freelancerId)
                        .role("FREELANCER")
                        .availableBalance(0.0)
                        .frozenBalance(0.0)
                        .build()
                );

        Double availableFreelancer = freelancerWallet.getAvailableBalance() != null ? freelancerWallet.getAvailableBalance() : 0.0;
        freelancerWallet.setAvailableBalance(availableFreelancer + amount);
        walletRepository.save(freelancerWallet);
    }

    private WalletResponseDTO toResponse(Wallet wallet) {
        return WalletResponseDTO.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUserId())
                .role(wallet.getRole())
                .availableBalance(wallet.getAvailableBalance())
                .frozenBalance(wallet.getFrozenBalance())
                .build();
    }
}
