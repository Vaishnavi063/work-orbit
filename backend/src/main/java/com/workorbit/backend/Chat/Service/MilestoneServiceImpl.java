package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.MilestoneRequest;
import com.workorbit.backend.Chat.DTO.MilestoneResponse;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.Entity.Milestone;
import com.workorbit.backend.Chat.Enum.MilestoneStatus;
import com.workorbit.backend.Chat.Repository.ChatRoomRepository;
import com.workorbit.backend.Chat.Repository.MilestoneRepository;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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
        milestone.setDueDate(request.getDueDate());
        milestone.setStatus(MilestoneStatus.PENDING);
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully created milestone with ID: {}", savedMilestone.getId());
        
        // Format due date for display
        String formattedDueDate = savedMilestone.getDueDate() != null ? 
            savedMilestone.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "No due date";
        
        // Create detailed notification message
        StringBuilder notificationMsg = new StringBuilder();
        notificationMsg.append("🏆 **New Milestone Created**\n");
        notificationMsg.append("Title: ").append(savedMilestone.getTitle()).append("\n");
        
        if (savedMilestone.getDescription() != null && !savedMilestone.getDescription().isEmpty()) {
            notificationMsg.append("Description: ").append(savedMilestone.getDescription()).append("\n");
        }
        
        notificationMsg.append("Due Date: ").append(formattedDueDate).append("\n");
        notificationMsg.append("Status: Pending");
        
        // Send detailed chat notification about milestone creation
        sendMilestoneNotification(contractId, notificationMsg.toString(), ChatMessage.MessageType.MILESTONE_UPDATE);
        
        return mapToMilestoneResponse(savedMilestone);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestoneStatus(Long milestoneId, MilestoneStatus status) {
        log.info("Updating milestone status for ID: {} to status: {}", milestoneId, status);
        
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found with ID: " + milestoneId));
        
        MilestoneStatus previousStatus = milestone.getStatus();
        
        // Skip update if status hasn't changed
        if (previousStatus == status) {
            log.info("Milestone status unchanged, skipping update");
            return mapToMilestoneResponse(milestone);
        }
        
        milestone.setStatus(status);
        Milestone updatedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully updated milestone status from {} to {}", previousStatus, status);
        
        // Create detailed notification message with emoji based on status
        StringBuilder notificationMsg = new StringBuilder();
        
        switch (status) {
            case IN_PROGRESS:
                notificationMsg.append("🚀 **Milestone Started**\n");
                break;
            case COMPLETED:
                notificationMsg.append("✅ **Milestone Completed**\n");
                break;
            case OVERDUE:
                notificationMsg.append("⚠️ **Milestone Overdue**\n");
                break;
            default:
                notificationMsg.append("📝 **Milestone Status Updated**\n");
        }
        
        notificationMsg.append("Title: ").append(milestone.getTitle()).append("\n");
        notificationMsg.append("Status changed from ").append(formatStatusForDisplay(previousStatus));
        notificationMsg.append(" to ").append(formatStatusForDisplay(status)).append("\n");
        
        // Add completion percentage for the contract if milestone is completed
        if (status == MilestoneStatus.COMPLETED) {
            Double completionPercentage = getContractCompletionPercentage(milestone.getContract().getContractId());
            notificationMsg.append("Project completion: ").append(String.format("%.1f%%", completionPercentage));
        }
        
        // Send detailed chat notification about status change
        sendMilestoneNotification(
            milestone.getContract().getContractId(), 
            notificationMsg.toString(),
            ChatMessage.MessageType.MILESTONE_UPDATE
        );
        
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
        
        List<Milestone> milestones = milestoneRepository.findByContract_ContractIdOrderByCreatedAtAsc(contractId);
        log.info("Found {} milestones for contract ID: {}", milestones.size(), contractId);
        
        return milestones.stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getContractMilestonesByStatus(Long contractId, MilestoneStatus status) {
        log.info("Retrieving milestones for contract ID: {} with status: {}", contractId, status);
        
        // Validate contract exists
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found with ID: " + contractId);
        }
        
        List<Milestone> milestones = milestoneRepository.findByContract_ContractIdAndStatusOrderByCreatedAtAsc(contractId, status);
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
        
        // Store original values for comparison
        String originalTitle = milestone.getTitle();
        String originalDescription = milestone.getDescription();
        LocalDateTime originalDueDate = milestone.getDueDate();
        
        // Update milestone fields
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setDueDate(request.getDueDate());
        
        Milestone updatedMilestone = milestoneRepository.save(milestone);
        log.info("Successfully updated milestone details for ID: {}", milestoneId);
        
        // Format due dates for display
        String formattedNewDueDate = updatedMilestone.getDueDate() != null ? 
            updatedMilestone.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "No due date";
        String formattedOldDueDate = originalDueDate != null ? 
            originalDueDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "No due date";
        
        // Create detailed notification message
        StringBuilder notificationMsg = new StringBuilder();
        notificationMsg.append("📝 **Milestone Updated**\n");
        notificationMsg.append("Title: ").append(updatedMilestone.getTitle()).append("\n");
        
        // Add details about what changed
        if (!originalTitle.equals(updatedMilestone.getTitle())) {
            notificationMsg.append("Title changed from \"").append(originalTitle).append("\" to \"")
                          .append(updatedMilestone.getTitle()).append("\"\n");
        }
        
        if ((originalDescription == null && updatedMilestone.getDescription() != null) ||
            (originalDescription != null && !originalDescription.equals(updatedMilestone.getDescription()))) {
            notificationMsg.append("Description updated\n");
        }
        
        if ((originalDueDate == null && updatedMilestone.getDueDate() != null) ||
            (originalDueDate != null && !originalDueDate.equals(updatedMilestone.getDueDate()))) {
            notificationMsg.append("Due date changed from ").append(formattedOldDueDate)
                          .append(" to ").append(formattedNewDueDate).append("\n");
        }
        
        // Send detailed chat notification about milestone update
        sendMilestoneNotification(milestone.getContract().getContractId(), 
                                 notificationMsg.toString(), 
                                 ChatMessage.MessageType.MILESTONE_UPDATE);
        
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
        String milestoneDescription = milestone.getDescription();
        LocalDateTime milestoneDueDate = milestone.getDueDate();
        MilestoneStatus milestoneStatus = milestone.getStatus();
        
        milestoneRepository.delete(milestone);
        log.info("Successfully deleted milestone with ID: {}", milestoneId);
        
        // Format due date for display
        String formattedDueDate = milestoneDueDate != null ? 
            milestoneDueDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "No due date";
        
        // Create detailed notification message
        StringBuilder notificationMsg = new StringBuilder();
        notificationMsg.append("🗑️ **Milestone Deleted**\n");
        notificationMsg.append("Title: ").append(milestoneTitle).append("\n");
        
        if (milestoneDescription != null && !milestoneDescription.isEmpty()) {
            notificationMsg.append("Description: ").append(milestoneDescription).append("\n");
        }
        
        notificationMsg.append("Due Date: ").append(formattedDueDate).append("\n");
        notificationMsg.append("Status: ").append(formatStatusForDisplay(milestoneStatus));
        
        // Send detailed chat notification about milestone deletion
        sendMilestoneNotification(contractId, notificationMsg.toString(), ChatMessage.MessageType.MILESTONE_UPDATE);
    }

    @Override
    @Transactional
    public void updateMilestoneProgressTracking() {
        log.info("Starting automatic milestone progress tracking update");
        
        LocalDateTime currentTime = LocalDateTime.now();
        List<Milestone> overdueMilestones = milestoneRepository.findMilestonesNeedingStatusUpdate(currentTime);
        
        log.info("Found {} milestones that need status update to OVERDUE", overdueMilestones.size());
        
        for (Milestone milestone : overdueMilestones) {
            MilestoneStatus previousStatus = milestone.getStatus();
            milestone.setStatus(MilestoneStatus.OVERDUE);
            milestoneRepository.save(milestone);
            
            log.info("Updated milestone ID: {} from {} to OVERDUE", milestone.getId(), previousStatus);
            
            // Format due date for display
            String formattedDueDate = milestone.getDueDate() != null ? 
                milestone.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "No due date";
            
            // Create detailed notification message
            StringBuilder notificationMsg = new StringBuilder();
            notificationMsg.append("⚠️ **Milestone Overdue**\n");
            notificationMsg.append("Title: ").append(milestone.getTitle()).append("\n");
            notificationMsg.append("Due Date: ").append(formattedDueDate).append("\n");
            notificationMsg.append("Status changed from ").append(formatStatusForDisplay(previousStatus));
            notificationMsg.append(" to ").append(formatStatusForDisplay(MilestoneStatus.OVERDUE)).append("\n");
            notificationMsg.append("This milestone is now past its due date and requires attention.");
            
            // Send detailed chat notification about overdue status
            sendMilestoneNotification(
                milestone.getContract().getContractId(), 
                notificationMsg.toString(),
                ChatMessage.MessageType.MILESTONE_UPDATE
            );
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
                .filter(milestone -> milestone.getStatus() != MilestoneStatus.COMPLETED)
                .toList();
        
        log.info("Found {} overdue milestones for contract ID: {}", filteredOverdue.size(), contractId);
        
        return filteredOverdue.stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    /**
     * Sends a milestone-related notification to the contract chat.
     * Enhanced to provide more detailed notifications and ensure proper chat integration.
     * 
     * @param contractId the contract ID
     * @param message the notification message
     * @param messageType the type of milestone message (optional)
     */
    private void sendMilestoneNotification(Long contractId, String message, ChatMessage.MessageType messageType) {
        try {
            // Find the contract chat room
            Optional<ChatRoom> contractChatOpt = chatRoomRepository.findByChatTypeAndReferenceId(
                    ChatRoom.ChatType.CONTRACT, contractId);
            
            if (contractChatOpt.isPresent()) {
                ChatRoom contractChat = contractChatOpt.get();
                
                // Use the enhanced sendSystemNotification method with the appropriate message type
                chatService.sendSystemNotification(
                    contractChat.getId(), 
                    message, 
                    messageType != null ? messageType : ChatMessage.MessageType.MILESTONE_UPDATE
                );
                
                log.info("Sent milestone notification to contract chat: {} with type: {}", 
                    message, messageType != null ? messageType : ChatMessage.MessageType.MILESTONE_UPDATE);
            } else {
                log.warn("No contract chat found for contract ID: {}. Creating new contract chat.", contractId);
                
                // Create a new contract chat if it doesn't exist
                try {
                    ChatRoom newChat = chatService.createContractChat(contractId);
                    
                    // Use the enhanced sendSystemNotification method with the appropriate message type
                    chatService.sendSystemNotification(
                        newChat.getId(), 
                        message, 
                        messageType != null ? messageType : ChatMessage.MessageType.MILESTONE_UPDATE
                    );
                    
                    log.info("Created new contract chat and sent milestone notification: {}", message);
                } catch (Exception e) {
                    log.error("Failed to create contract chat for contract ID: {}", contractId, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send milestone notification for contract ID: {}", contractId, e);
            // Don't fail the entire operation if notification fails
        }
    }
    
    /**
     * Overloaded method for backward compatibility.
     * Always uses MILESTONE_UPDATE message type.
     */
    private void sendMilestoneNotification(Long contractId, String message) {
        sendMilestoneNotification(contractId, message, ChatMessage.MessageType.MILESTONE_UPDATE);
    }

    /**
     * Formats a status change message for chat notifications.
     */
    private String formatStatusChangeMessage(String milestoneTitle, 
                                           MilestoneStatus previousStatus, 
                                           MilestoneStatus newStatus) {
        return String.format("Milestone '%s' status changed from %s to %s", 
                milestoneTitle, 
                formatStatusForDisplay(previousStatus), 
                formatStatusForDisplay(newStatus));
    }

    /**
     * Formats milestone status for user-friendly display.
     */
    private String formatStatusForDisplay(MilestoneStatus status) {
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
        response.setDueDate(milestone.getDueDate());
        response.setStatus(milestone.getStatus());
        response.setCreatedAt(milestone.getCreatedAt());
        response.setUpdatedAt(milestone.getUpdatedAt());
        
        return response;
    }
}