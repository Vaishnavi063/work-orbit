package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.MilestoneRequest;
import com.workorbit.backend.Chat.DTO.MilestoneResponse;
import com.workorbit.backend.Chat.Entity.Milestone;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service interface for managing milestone operations including CRUD operations,
 * status updates, and automatic progress tracking.
 */
public interface MilestoneService {

    /**
     * Creates a new milestone for a contract.
     * 
     * @param contractId the ID of the contract
     * @param request the milestone creation request
     * @return the created milestone response
     */
    @Transactional
    MilestoneResponse createMilestone(Long contractId, MilestoneRequest request);
    
    /**
     * Updates the status of a milestone and sends chat notifications.
     * 
     * @param milestoneId the ID of the milestone
     * @param status the new milestone status
     * @return the updated milestone response
     */
    @Transactional
    MilestoneResponse updateMilestoneStatus(Long milestoneId, Milestone.MilestoneStatus status);
    
    /**
     * Retrieves all milestones for a specific contract.
     * 
     * @param contractId the ID of the contract
     * @return list of milestone responses
     */
    @Transactional(readOnly = true)
    List<MilestoneResponse> getContractMilestones(Long contractId);
    
    /**
     * Retrieves milestones by status for a specific contract.
     * 
     * @param contractId the ID of the contract
     * @param status the milestone status to filter by
     * @return list of milestone responses
     */
    @Transactional(readOnly = true)
    List<MilestoneResponse> getContractMilestonesByStatus(Long contractId, Milestone.MilestoneStatus status);
    
    /**
     * Gets a milestone by its ID.
     * 
     * @param milestoneId the ID of the milestone
     * @return the milestone response
     */
    @Transactional(readOnly = true)
    MilestoneResponse getMilestoneById(Long milestoneId);
    
    /**
     * Updates milestone details.
     * 
     * @param milestoneId the ID of the milestone
     * @param request the milestone update request
     * @return the updated milestone response
     */
    @Transactional
    MilestoneResponse updateMilestone(Long milestoneId, MilestoneRequest request);
    
    /**
     * Deletes a milestone.
     * 
     * @param milestoneId the ID of the milestone
     */
    @Transactional
    void deleteMilestone(Long milestoneId);
    
    /**
     * Automatically updates milestone progress tracking by checking due dates
     * and updating overdue milestones.
     */
    @Transactional
    void updateMilestoneProgressTracking();
    
    /**
     * Gets the completion percentage for a contract based on milestone status.
     * 
     * @param contractId the ID of the contract
     * @return the completion percentage (0-100)
     */
    @Transactional(readOnly = true)
    Double getContractCompletionPercentage(Long contractId);
    
    /**
     * Gets overdue milestones for a specific contract.
     * 
     * @param contractId the ID of the contract
     * @return list of overdue milestone responses
     */
    @Transactional(readOnly = true)
    List<MilestoneResponse> getOverdueMilestones(Long contractId);
}