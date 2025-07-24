package com.workorbit.backend.Wallet.Service;


import com.workorbit.backend.Wallet.DTO.*;
import com.workorbit.backend.Wallet.Entity.WalletTransaction;
import com.workorbit.backend.Wallet.Repository.*;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FreelancerRevenueService {

    private final WalletTransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectRepository projectRepository;

    public FreelancerRevenueDTO getFreelancerRevenue(Long freelancerId) {
        var freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        var wallet = walletRepository.findByUserIdAndRole(freelancerId, "FREELANCER")
                .orElse(null);

        Double totalEarnings = transactionRepository.getTotalEarningsByFreelancer(freelancerId);
        Double totalWithdrawn = transactionRepository.getTotalWithdrawnByFreelancer(freelancerId);
        Integer completedProjects = transactionRepository.getCompletedProjectsCount(freelancerId);

        List<WalletTransaction> recentTransactions = transactionRepository
                .findByUserIdAndUserRoleOrderByCreatedAtDesc(freelancerId, "FREELANCER")
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        return FreelancerRevenueDTO.builder()
                .freelancerId(freelancerId)
                .freelancerName(freelancer.getName())
                .totalEarnings(totalEarnings != null ? totalEarnings : 0.0)
                .currentBalance(wallet != null ? wallet.getAvailableBalance() : 0.0)
                .totalWithdrawn(totalWithdrawn != null ? totalWithdrawn : 0.0)
                .completedProjects(completedProjects != null ? completedProjects : 0)
                .recentTransactions(mapToRevenueTransactions(recentTransactions))
                .monthlyBreakdown(getMonthlyBreakdown(freelancerId))
                .build();
    }

    private List<RevenueTransactionDTO> mapToRevenueTransactions(List<WalletTransaction> transactions) {
        return transactions.stream()
                .map(transaction -> {
                    String projectTitle = "Unknown Project";
                    String clientName = "Unknown Client";

                    if (transaction.getProjectId() != null) {
                        var project = projectRepository.findById(transaction.getProjectId());
                        if (project.isPresent()) {
                            projectTitle = project.get().getTitle();
                            clientName = project.get().getClient().getName();
                        }
                    }

                    return RevenueTransactionDTO.builder()
                            .projectId(transaction.getProjectId())
                            .projectTitle(projectTitle)
                            .clientName(clientName)
                            .amount(transaction.getAmount())
                            .receivedAt(transaction.getCreatedAt())
                            .status(transaction.getTransactionType().equals("CREDIT") ? "RECEIVED" : "WITHDRAWN")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private MonthlyRevenueDTO getMonthlyBreakdown(Long freelancerId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLastMonth = startOfCurrentMonth.minusMonths(1);
        LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);

        List<WalletTransaction> currentMonthTransactions = transactionRepository
                .getFreelancerEarningsBetweenDates(freelancerId, startOfCurrentMonth, now);
        Double currentMonth = currentMonthTransactions.stream()
                .mapToDouble(WalletTransaction::getAmount)
                .sum();

        List<WalletTransaction> lastMonthTransactions = transactionRepository
                .getFreelancerEarningsBetweenDates(freelancerId, startOfLastMonth, startOfCurrentMonth);
        Double lastMonth = lastMonthTransactions.stream()
                .mapToDouble(WalletTransaction::getAmount)
                .sum();

        List<WalletTransaction> yearTransactions = transactionRepository
                .getFreelancerEarningsBetweenDates(freelancerId, startOfYear, now);
        Double currentYear = yearTransactions.stream()
                .mapToDouble(WalletTransaction::getAmount)
                .sum();

        return MonthlyRevenueDTO.builder()
                .currentMonth(currentMonth)
                .lastMonth(lastMonth)
                .currentYear(currentYear)
                .monthlyData(getMonthlyDataPoints(freelancerId))
                .build();
    }

    private List<MonthlyDataPoint> getMonthlyDataPoints(Long freelancerId) {
        return List.of();
    }
}