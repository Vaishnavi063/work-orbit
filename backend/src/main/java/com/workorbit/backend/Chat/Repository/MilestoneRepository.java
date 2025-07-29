package com.workorbit.backend.Chat.Repository;

import com.workorbit.backend.Chat.Entity.Milestone;
import com.workorbit.backend.Chat.Enum.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    
    // Find milestones by contract ID ordered by creation date
    List<Milestone> findByContract_ContractIdOrderByCreatedAtAsc(Long contractId);
    
    // Find milestones by contract ID and status
    List<Milestone> findByContract_ContractIdAndStatusOrderByCreatedAtAsc(Long contractId, MilestoneStatus status);
    
    // Find milestones by status across all contracts
    List<Milestone> findByStatusOrderByDueDateAsc(MilestoneStatus status);
    
    // Find overdue milestones (due date passed and not completed)
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.dueDate < :currentDate AND " +
           "m.status NOT IN ('COMPLETED') " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findOverdueMilestones(@Param("currentDate") LocalDateTime currentDate);
    
    // Find milestones due within a specific timeframe
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.dueDate BETWEEN :startDate AND :endDate AND " +
           "m.status NOT IN ('COMPLETED') " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findMilestonesDueBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    // Find milestones for a specific contract with status filtering
    List<Milestone> findByContract_ContractIdAndStatusInOrderByCreatedAtAsc(Long contractId, List<MilestoneStatus> statuses);
    
    // Count milestones by contract ID and status
    Long countByContract_ContractIdAndStatus(Long contractId, MilestoneStatus status);
    
    // Count total milestones for a contract
    Long countByContract_ContractId(Long contractId);
    
    // Find pending milestones for a contract
    List<Milestone> findByContract_ContractIdAndStatusOrderByDueDateAsc(Long contractId, MilestoneStatus status);
    
    // Find milestones by contract ID with due date filtering
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.contract.contractId = :contractId AND " +
           "m.dueDate <= :dueDate " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findByContractIdAndDueDateBefore(@Param("contractId") Long contractId, 
                                                   @Param("dueDate") LocalDateTime dueDate);
    
    // Get milestone completion percentage for a contract
    @Query("SELECT " +
           "CASE WHEN COUNT(m) = 0 THEN 0.0 " +
           "ELSE CAST(COUNT(CASE WHEN m.status = 'COMPLETED' THEN 1 END) AS double) / " +
           "CAST(COUNT(m) AS double) * 100 END " +
           "FROM Milestone m WHERE m.contract.contractId = :contractId")
    Double getCompletionPercentageByContractId(@Param("contractId") Long contractId);
    
    // Find milestones that need status update (overdue but not marked as overdue)
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.dueDate < :currentDate AND " +
           "m.status IN ('PENDING', 'IN_PROGRESS') " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findMilestonesNeedingStatusUpdate(@Param("currentDate") LocalDateTime currentDate);
}