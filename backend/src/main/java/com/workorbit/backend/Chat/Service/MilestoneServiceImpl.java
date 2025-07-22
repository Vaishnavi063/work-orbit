package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.MilestoneRequest;
import com.workorbit.backend.Chat.DTO.MilestoneResponse;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.Entity.Milestone;
import com.workorbit.backend.Chat.Repository.ChatRoomRepository;
import com.workorbit.backend.Chat.Repository.MilestoneRepository;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of MilestoneService for managing milestone operations including
 * CRUD operations, status updates, and automatic progress tracking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ContractRepository contractRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatService chatService;

    @Override
    @Transactional
    public MilestoneResponse createMilestone(Long contractId, MilestoneRequest request) {
        log.info("Creating milestone for contract ID: {}", contractId);
        
        // Validate contract exists
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with ID: " + contractId));
        
        // Create milestone entity
        Milestone milestone = new Milestone();
        milestone.setContract(contract);
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setAmount(request.getAmount());
        milestone.setDueDate(request.getDueDate());
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully created milestone with ID: {}", savedMilestone.getId());
        
        // Send chat notification about milestone creation
        sendMilestoneNotification(contractId, 
                String.format("New milestone created: %s", savedMilestone.getTitle()));
        
        return mapToMilestoneResponse(savedMilestone);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestoneStatus(Long milestoneId, Milestone.MilestoneStatus status) {
        log.info("Updating milestone status for ID: {} to status: {}", milestoneId, status);
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found with ID: " + milestoneId));
        
        Milestone.MilestoneStatus previousStatus = milestone.getStatus();
        milestone.setStatus(status);
        
        Milestone updatedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully updated milestone status from {} to {}", previousStatus, status);
        
        // Send chat notification about status change
        String statusMessage = formatStatusChangeMessage(milestone.getTitle(), previousStatus, status);
        sendMilestoneNotification(milestone.getContract().getContractId(), statusMessage);
        
        return mapToMilestoneResponse(updatedMilestone);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getContractMilestones(Long contractId) {
        log.info("Retrieving milestones for contract ID: {}", contractId);
        
        // Validate contract exists
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found with ID: " + contractId);
        }
        
        List<Milestone> milestones = milestoneRepository.findByContract_IdOrderByCreatedAtAsc(contractId);
        log.info("Found {} milestones for contract ID: {}", milestones.size(), contractId);
        
        return milestones.stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getContractMilestonesByStatus(Long contractId, Milestone.MilestoneStatus status) {
        log.info("Retrieving milestones for contract ID: {} with status: {}", contractId, status);
        
        // Validate contract exists
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found with ID: " + contractId);
        }
        
        List<Milestone> milestones = milestoneRepository.findByContract_IdAndStatusOrderByCreatedAtAsc(contractId, status);
        log.info("Found {} milestones with status {} for contract ID: {}", milestones.size(), status, contractId);
        
        return milestones.stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MilestoneResponse getMilestoneById(Long milestoneId) {
        log.info("Retrieving milestone by ID: {}", milestoneId);
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found with ID: " + milestoneId));
        
        return mapToMilestoneResponse(milestone);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestone(Long milestoneId, MilestoneRequest request) {
        log.info("Updating milestone details for ID: {}", milestoneId);
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found with ID: " + milestoneId));
        
        // Update milestone fields
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setAmount(request.getAmount());
        milestone.setDueDate(request.getDueDate());
        
        Milestone updatedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully updated milestone details for ID: {}", milestoneId);
        
        // Send chat notification about milestone update
        sendMilestoneNotification(milestone.getContract().getContractId(),
                String.format("Milestone updated: %s", updatedMilestone.getTitle()));
        
        return mapToMilestoneResponse(updatedMilestone);
    }

    @Override
    @Transactional
    public void deleteMilestone(Long milestoneId) {
        log.info("Deleting milestone with ID: {}", milestoneId);
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found with ID: " + milestoneId));
        
        Long contractId = milestone.getContract().getContractId();
        String milestoneTitle = milestone.getTitle();
        
        milestoneRepository.delete(milestone);
        log.info("Successfully deleted milestone with ID: {}", milestoneId);
        
        // Send chat notification about milestone deletion
        sendMilestoneNotification(contractId, 
                String.format("Milestone deleted: %s", milestoneTitle));
    }

    @Override
    @Transactional
    public void updateMilestoneProgressTracking() {
        log.info("Starting automatic milestone progress tracking update");
        
        LocalDateTime currentTime = LocalDateTime.now();
        List<Milestone> overdueMilestones = milestoneRepository.findMilestonesNeedingStatusUpdate(currentTime);
        
        log.info("Found {} milestones that need status update to OVERDUE", overdueMilestones.size());
        
        for (Milestone milestone : overdueMilestones) {
            Milestone.MilestoneStatus previousStatus = milestone.getStatus();
            milestone.setStatus(Milestone.MilestoneStatus.OVERDUE);
            milestoneRepository.save(milestone);
            
            log.info("Updated milestone ID: {} from {} to OVERDUE", milestone.getId(), previousStatus);
            
            // Send chat notification about overdue status
            String overdueMessage = String.format("Milestone '%s' is now overdue (due: %s)", 
                    milestone.getTitle(), 
                    milestone.getDueDate().toLocalDate());
            sendMilestoneNotification(milestone.getContract().getContractId(), overdueMessage);
        }
        
        log.info("Completed automatic milestone progress tracking update");
    }

    @Override
    @Transactional(readOnly = true)
    public Double getContractCompletionPercentage(Long contractId) {
        log.info("Calculating completion percentage for contract ID: {}", contractId);
        
        // Validate contract exists
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found with ID: " + contractId);
        }
        
        Double completionPercentage = milestoneRepository.getCompletionPercentageByContractId(contractId);
        
        // Handle case where no milestones exist
        if (completionPercentage == null) {
            completionPercentage = 0.0;
        }
        
        log.info("Contract ID: {} has completion percentage: {}%", contractId, completionPercentage);
        return completionPercentage;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getOverdueMilestones(Long contractId) {
        log.info("Retrieving overdue milestones for contract ID: {}", contractId);
        
        // Validate contract exists
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found with ID: " + contractId);
        }
        
        LocalDateTime currentTime = LocalDateTime.now();
        List<Milestone> overdueMilestones = milestoneRepository.findByContractIdAndDueDateBefore(contractId, currentTime);
        
        // Filter to only include non-completed milestones
        List<Milestone> filteredOverdue = overdueMilestones.stream()
                .filter(milestone -> milestone.getStatus() != Milestone.MilestoneStatus.COMPLETED)
                .toList();
        
        log.info("Found {} overdue milestones for contract ID: {}", filteredOverdue.size(), contractId);
        
        return filteredOverdue.stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    /**
     * Sends a milestone-related notification to the contract chat.
     */
    private void sendMilestoneNotification(Long contractId, String message) {
        try {
            // Find the contract chat room
            ChatRoom contractChat = chatRoomRepository.findByChatTypeAndReferenceId(
                    ChatRoom.ChatType.CONTRACT, contractId).orElse(null);
            
            if (contractChat != null) {
                chatService.sendSystemNotification(contractChat.getId(), message);
                log.info("Sent milestone notification to contract chat: {}", message);
            } else {
                log.warn("No contract chat found for contract ID: {}", contractId);
            }
        } catch (Exception e) {
            log.error("Failed to send milestone notification for contract ID: {}", contractId, e);
            // Don't fail the entire operation if notification fails
        }
    }

    /**
     * Formats a status change message for chat notifications.
     */
    private String formatStatusChangeMessage(String milestoneTitle, 
                                           Milestone.MilestoneStatus previousStatus, 
                                           Milestone.MilestoneStatus newStatus) {
        return String.format("Milestone '%s' status changed from %s to %s", 
                milestoneTitle, 
                formatStatusForDisplay(previousStatus), 
                formatStatusForDisplay(newStatus));
    }

    /**
     * Formats milestone status for user-friendly display.
     */
    private String formatStatusForDisplay(Milestone.MilestoneStatus status) {
        return switch (status) {
            case PENDING -> "Pending";
            case IN_PROGRESS -> "In Progress";
            case COMPLETED -> "Completed";
            case OVERDUE -> "Overdue";
        };
    }

    /**
     * Maps Milestone entity to MilestoneResponse DTO.
     */
    private MilestoneResponse mapToMilestoneResponse(Milestone milestone) {
        MilestoneResponse response = new MilestoneResponse();
        response.setId(milestone.getId());
        response.setContractId(milestone.getContract().getContractId());
        response.setTitle(milestone.getTitle());
        response.setDescription(milestone.getDescription());
        response.setAmount(milestone.getAmount());
        response.setDueDate(milestone.getDueDate());
        response.setStatus(milestone.getStatus());
        response.setCreatedAt(milestone.getCreatedAt());
        response.setUpdatedAt(milestone.getUpdatedAt());
        
        return response;
    }
}