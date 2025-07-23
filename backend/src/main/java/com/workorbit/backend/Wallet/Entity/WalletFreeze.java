package com.workorbit.backend.Wallet.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletFreeze {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long freezeId;

    private Long projectId;

    private Long clientId;

    private Double amount;

    private String status;
}
