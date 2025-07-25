package com.workorbit.backend.Wallet.Repository;


import com.workorbit.backend.Wallet.Entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserIdAndRole(Long userId, String role);
}
