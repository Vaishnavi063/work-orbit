package com.workorbit.backend.Wallet.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    private Long userId;
    private String userRole;
    private String transactionType; // CREDIT, DEBIT, FREEZE, RELEASE
    private Double amount;
    private Double balanceBefore;
    private Double balanceAfter;
    private Long projectId;
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
