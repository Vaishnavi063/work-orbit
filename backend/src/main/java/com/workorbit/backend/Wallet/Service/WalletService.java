package com.workorbit.backend.Wallet.Service;

import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ProjectRepository;
import com.workorbit.backend.Wallet.DTO.FrozenAmountDTO;
import com.workorbit.backend.Wallet.DTO.WalletRequestDTO;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.DTO.WithdrawRequestDTO;
import com.workorbit.backend.Wallet.Entity.Wallet;
import com.workorbit.backend.Wallet.Entity.WalletFreeze;
import com.workorbit.backend.Wallet.Entity.WalletTransaction;
import com.workorbit.backend.Wallet.Repository.WalletFreezeRepository;
import com.workorbit.backend.Wallet.Repository.WalletRepository;
import com.workorbit.backend.Wallet.Repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    @Autowired
    private WalletTransactionRepository transactionRepository;
    @Autowired
    private ProjectRepository projectRepository;
    private final WalletRepository walletRepository;
    private final WalletFreezeRepository walletFreezeRepository;

    private String normalizeRole(String role) {
        if (role.equalsIgnoreCase("ROLE_CLIENT")) return "CLIENT";
        if (role.equalsIgnoreCase("ROLE_FREELANCER")) return "FREELANCER";
        return role.toUpperCase();
    }

    public WalletResponseDTO addMoney(WalletRequestDTO request) {
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        String normalizedRole = normalizeRole(request.getRole());

        Wallet wallet = walletRepository.findByUserIdAndRole(request.getUserId(), normalizedRole)
                .orElse(Wallet.builder()
                        .userId(request.getUserId())
                        .role(normalizedRole)
                        .availableBalance(0.0)
                        .frozenBalance(0.0)
                        .build()
                );

        Double balanceBefore = wallet.getAvailableBalance() != null ? wallet.getAvailableBalance() : 0.0;
        Double newBalance = balanceBefore + request.getAmount();
        wallet.setAvailableBalance(newBalance);
        walletRepository.save(wallet);

        // ✅ ADD THIS - LOG TRANSACTION
        WalletTransaction transaction = WalletTransaction.builder()
                .userId(request.getUserId())
                .userRole(normalizedRole)
                .transactionType("CREDIT")
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(newBalance)
                .description("Money added to wallet")
                .build();
        transactionRepository.save(transaction);

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

        Double availableBefore = wallet.getAvailableBalance();

        if (availableBefore == null || availableBefore < request.getAmount()) {
            throw new RuntimeException("Insufficient balance for withdrawal.");
        }

        wallet.setAvailableBalance(availableBefore - request.getAmount());
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .userId(request.getUserId())
                .userRole("FREELANCER")
                .transactionType("DEBIT")
                .amount(request.getAmount())
                .balanceBefore(availableBefore)
                .balanceAfter(availableBefore - request.getAmount())
                .description("Withdrawal to bank account")
                .build();
        transactionRepository.save(transaction);

        return toResponse(wallet);
    }
    public void freezeAmount(Long clientId, Long projectId, Double amount) {
        Wallet wallet = walletRepository.findByUserIdAndRole(clientId, "CLIENT")
                .orElseThrow(() -> new RuntimeException("Client wallet not found"));

        Double available = wallet.getAvailableBalance() != null ? wallet.getAvailableBalance() : 0.0;
        Double frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0.0;

        if (available < amount) {
            throw new RuntimeException("Insufficient funds to accept this bid.");
        }

        // Update wallet balances
        wallet.setAvailableBalance(available - amount);
        wallet.setFrozenBalance(frozen + amount);
        walletRepository.save(wallet);

        // Create freeze entry for tracking
        WalletFreeze freeze = WalletFreeze.builder()
                .clientId(clientId)
                .projectId(projectId)
                .amount(amount)
                .status("FROZEN")
                .build();
        walletFreezeRepository.save(freeze);

        WalletTransaction transaction = WalletTransaction.builder()
                .userId(clientId)
                .userRole("CLIENT")
                .transactionType("FREEZE")
                .amount(amount)
                .balanceBefore(available)
                .balanceAfter(available - amount)
                .projectId(projectId)
                .description("Amount frozen for project bid acceptance")
                .build();
        transactionRepository.save(transaction);
    }

    public void releasePayment(Long clientId, Long freelancerId, Long projectId, Double amount) {
        // Fetch and update freeze entry
        WalletFreeze freeze = walletFreezeRepository.findByProjectIdAndClientIdAndStatus(projectId, clientId, "FROZEN");
        if (freeze == null) {
            throw new RuntimeException("No frozen funds found for this project and client.");
        }
        freeze.setStatus("RELEASED");
        walletFreezeRepository.save(freeze);

        // Deduct frozen funds from client
        Wallet clientWallet = walletRepository.findByUserIdAndRole(clientId, "CLIENT")
                .orElseThrow(() -> new RuntimeException("Client wallet not found"));

        Double frozen = clientWallet.getFrozenBalance() != null ? clientWallet.getFrozenBalance() : 0.0;
        if (frozen < amount) {
            throw new RuntimeException("Insufficient frozen funds to release payment.");
        }

        clientWallet.setFrozenBalance(frozen - amount);
        walletRepository.save(clientWallet);

        // Credit amount to freelancer wallet
        Wallet freelancerWallet = walletRepository.findByUserIdAndRole(freelancerId, "FREELANCER")
                .orElse(Wallet.builder()
                        .userId(freelancerId)
                        .role("FREELANCER")
                        .availableBalance(0.0)
                        .frozenBalance(0.0)
                        .build());

        Double availableFreelancer = freelancerWallet.getAvailableBalance() != null ? freelancerWallet.getAvailableBalance() : 0.0;
        freelancerWallet.setAvailableBalance(availableFreelancer + amount);
        walletRepository.save(freelancerWallet);

        WalletTransaction freelancerTransaction = WalletTransaction.builder()
                .userId(freelancerId)
                .userRole("FREELANCER")
                .transactionType("CREDIT")
                .amount(amount)
                .balanceBefore(availableFreelancer)
                .balanceAfter(availableFreelancer + amount)
                .projectId(projectId)
                .description("Payment received for project completion")
                .build();
        transactionRepository.save(freelancerTransaction);

        // 🎯 LOG TRANSACTION FOR CLIENT
        WalletTransaction clientTransaction = WalletTransaction.builder()
                .userId(clientId)
                .userRole("CLIENT")
                .transactionType("DEBIT")
                .amount(amount)
                .balanceBefore(frozen)
                .balanceAfter(frozen - amount)
                .projectId(projectId)
                .description("Payment released to freelancer")
                .build();
        transactionRepository.save(clientTransaction);
    }

    // Add this method to WalletService.java
    public List<FrozenAmountDTO> getClientFrozenAmounts(Long clientId) {
        List<WalletFreeze> frozenRecords = walletFreezeRepository.findByClientIdAndStatus(clientId, "FROZEN");

        return frozenRecords.stream()
                .map(freeze -> {
                    Project project = projectRepository.findById(freeze.getProjectId()).orElse(null);
                    String projectTitle = project != null ? project.getTitle() : "Unknown Project";

                    String freelancerName = "Unknown Freelancer";
                    if (project != null) {
                        Optional<Bids> acceptedBid = project.getBids().stream()
                                .filter(bid -> bid.getStatus() == Bids.bidStatus.Accepted)
                                .findFirst();
                        if (acceptedBid.isPresent()) {
                            freelancerName = acceptedBid.get().getFreelancer().getName();
                        }
                    }

                    return FrozenAmountDTO.builder()
                            .projectId(freeze.getProjectId())
                            .projectTitle(projectTitle)
                            .freelancerName(freelancerName)
                            .frozenAmount(freeze.getAmount())
                            .status(freeze.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
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
