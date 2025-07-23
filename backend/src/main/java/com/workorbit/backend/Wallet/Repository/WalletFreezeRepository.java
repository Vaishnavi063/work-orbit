package com.workorbit.backend.Wallet.Repository;

import com.workorbit.backend.Wallet.Entity.WalletFreeze;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WalletFreezeRepository extends JpaRepository<WalletFreeze, Long> {
    List<WalletFreeze> findByClientIdAndStatus(Long clientId, String status);
    WalletFreeze findByProjectIdAndClientIdAndStatus(Long projectId, Long clientId, String status);
}
