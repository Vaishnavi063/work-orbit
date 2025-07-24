package com.workorbit.backend.Wallet.Repository;


import com.workorbit.backend.Wallet.Entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByUserIdAndUserRoleOrderByCreatedAtDesc(Long userId, String userRole);

    @Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.userId = :userId AND wt.userRole = 'FREELANCER' AND wt.transactionType = 'CREDIT'")
    Double getTotalEarningsByFreelancer(@Param("userId") Long userId);

    @Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.userId = :userId AND wt.userRole = 'FREELANCER' AND wt.transactionType = 'DEBIT'")
    Double getTotalWithdrawnByFreelancer(@Param("userId") Long userId);

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.userId = :userId AND wt.userRole = 'FREELANCER' AND wt.transactionType = 'CREDIT' AND wt.createdAt BETWEEN :startDate AND :endDate")
    List<WalletTransaction> getFreelancerEarningsBetweenDates(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT wt.projectId) FROM WalletTransaction wt WHERE wt.userId = :userId AND wt.userRole = 'FREELANCER' AND wt.transactionType = 'CREDIT'")
    Integer getCompletedProjectsCount(@Param("userId") Long userId);
}