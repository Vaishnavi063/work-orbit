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
    
    List<Milestone> findByContract_ContractIdOrderByCreatedAtAsc(Long contractId);
    
    List<Milestone> findByContract_ContractIdAndStatusOrderByCreatedAtAsc(Long contractId, MilestoneStatus status);


    @Query("SELECT m FROM Milestone m WHERE " +
           "m.contract.contractId = :contractId AND " +
           "m.dueDate <= :dueDate " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findByContractIdAndDueDateBefore(@Param("contractId") Long contractId, 
                                                   @Param("dueDate") LocalDateTime dueDate);
    
    @Query("SELECT " +
           "CASE WHEN COUNT(m) = 0 THEN 0.0 " +
           "ELSE CAST(COUNT(CASE WHEN m.status = 'COMPLETED' THEN 1 END) AS double) / " +
           "CAST(COUNT(m) AS double) * 100 END " +
           "FROM Milestone m WHERE m.contract.contractId = :contractId")
    Double getCompletionPercentageByContractId(@Param("contractId") Long contractId);
    
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.dueDate < :currentDate AND " +
           "m.status IN ('PENDING', 'IN_PROGRESS') " +
           "ORDER BY m.dueDate ASC")
    List<Milestone> findMilestonesNeedingStatusUpdate(@Param("currentDate") LocalDateTime currentDate);
}