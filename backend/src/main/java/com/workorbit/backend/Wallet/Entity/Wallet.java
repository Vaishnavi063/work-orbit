package com.workorbit.backend.Wallet.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    private Long userId;

    private String role;

    private Double availableBalance;

    private Double frozenBalance;
}
