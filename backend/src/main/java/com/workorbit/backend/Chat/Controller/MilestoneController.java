package com.workorbit.backend.Chat.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workorbit.backend.Auth.DTO.AppUserDetails;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Chat.DTO.MilestoneRequest;
import com.workorbit.backend.Chat.DTO.MilestoneResponse;
import com.workorbit.backend.Chat.DTO.MilestoneStatusRequest;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.Enum.MilestoneStatus;
import com.workorbit.backend.Chat.Repository.ChatRoomRepository;
import com.workorbit.backend.Chat.Service.ChatService;
import com.workorbit.backend.Chat.Service.MilestoneService;
import com.workorbit.backend.DTO.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing milestone operations including creation, status
 * updates, and progress tracking within contract chats.
 */
@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
@Slf4j
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatService chatService;

    /**
     * Creates a new milestone for a contract.
     *
     * @param contractId the ID of the contract
     * @param request the milestone creation request
     * @return the created milestone response
     */
    @PostMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @PathVariable Long contractId,
            @Valid @RequestBody MilestoneRequest request) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            MilestoneResponse response = milestoneService.createMilestone(contractId, request);

            log.info("Milestone created for contract {} by user {}: {}",
                    contractId, userDetails.getProfileId(), response.getTitle());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error creating milestone for contract {}: {}", contractId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create milestone: " + e.getMessage()));
        }
    }

    /**
     * Updates the status of a milestone.
     *
     * @param milestoneId the ID of the milestone
     * @param request the milestone status update request
     * @return the updated milestone response
     */
    @PutMapping("/{milestoneId}/status")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestoneStatus(
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneStatusRequest request) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            MilestoneResponse response = milestoneService.updateMilestoneStatus(
                    milestoneId, request.getStatus());

            log.info("Milestone {} status updated to {} by user {}",
                    milestoneId, request.getStatus(), userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error updating milestone {} status: {}", milestoneId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update milestone status: " + e.getMessage()));
        }
    }

    /**
     * Retrieves all milestones for a specific contract.
     *
     * @param contractId the ID of the contract
     * @return list of milestone responses
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getContractMilestones(
            @PathVariable Long contractId) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            List<MilestoneResponse> milestones = milestoneService.getContractMilestones(contractId);

            log.info("Retrieved {} milestones for contract {} by user {}",
                    milestones.size(), contractId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(milestones));

        } catch (Exception e) {
            log.error("Error retrieving milestones for contract {}: {}", contractId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to retrieve milestones: " + e.getMessage()));
        }
    }

    /**
     * Retrieves milestones by status for a specific contract.
     *
     * @param contractId the ID of the contract
     * @param status the milestone status to filter by
     * @return list of milestone responses
     */
    @GetMapping("/contract/{contractId}/status/{status}")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getContractMilestonesByStatus(
            @PathVariable Long contractId,
            @PathVariable MilestoneStatus status) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            List<MilestoneResponse> milestones = milestoneService.getContractMilestonesByStatus(
                    contractId, status);

            log.info("Retrieved {} {} milestones for contract {} by user {}",
                    milestones.size(), status, contractId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(milestones));

        } catch (Exception e) {
            log.error("Error retrieving {} milestones for contract {}: {}",
                    status, contractId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to retrieve milestones: " + e.getMessage()));
        }
    }

    /**
     * Gets a milestone by its ID.
     *
     * @param milestoneId the ID of the milestone
     * @return the milestone response
     */
    @GetMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> getMilestoneById(
            @PathVariable Long milestoneId) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            MilestoneResponse milestone = milestoneService.getMilestoneById(milestoneId);

            log.info("Retrieved milestone {} by user {}", milestoneId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(milestone));

        } catch (Exception e) {
            log.error("Error retrieving milestone {}: {}", milestoneId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Milestone not found: " + e.getMessage()));
        }
    }

    /**
     * Updates milestone details.
     *
     * @param milestoneId the ID of the milestone
     * @param request the milestone update request
     * @return the updated milestone response
     */
    @PutMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneRequest request) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            MilestoneResponse response = milestoneService.updateMilestone(milestoneId, request);

            log.info("Milestone {} updated by user {}: {}",
                    milestoneId, userDetails.getProfileId(), response.getTitle());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error updating milestone {}: {}", milestoneId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update milestone: " + e.getMessage()));
        }
    }

    /**
     * Deletes a milestone.
     *
     * @param milestoneId the ID of the milestone
     * @return success response
     */
    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<String>> deleteMilestone(@PathVariable Long milestoneId) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            milestoneService.deleteMilestone(milestoneId);

            log.info("Milestone {} deleted by user {}", milestoneId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success("Milestone deleted successfully"));

        } catch (Exception e) {
            log.error("Error deleting milestone {}: {}", milestoneId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to delete milestone: " + e.getMessage()));
        }
    }

    /**
     * Gets the completion percentage for a contract based on milestone status.
     *
     * @param contractId the ID of the contract
     * @return the completion percentage (0-100)
     */
    @GetMapping("/contract/{contractId}/completion")
    public ResponseEntity<ApiResponse<Double>> getContractCompletionPercentage(
            @PathVariable Long contractId) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            Double completionPercentage = milestoneService.getContractCompletionPercentage(contractId);

            log.info("Retrieved completion percentage {} for contract {} by user {}",
                    completionPercentage, contractId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(completionPercentage));

        } catch (Exception e) {
            log.error("Error retrieving completion percentage for contract {}: {}",
                    contractId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to retrieve completion percentage: " + e.getMessage()));
        }
    }

    /**
     * Gets overdue milestones for a specific contract.
     *
     * @param contractId the ID of the contract
     * @return list of overdue milestone responses
     */
    @GetMapping("/contract/{contractId}/overdue")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getOverdueMilestones(
            @PathVariable Long contractId) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            List<MilestoneResponse> overdueMilestones = milestoneService.getOverdueMilestones(contractId);

            log.info("Retrieved {} overdue milestones for contract {} by user {}",
                    overdueMilestones.size(), contractId, userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success(overdueMilestones));

        } catch (Exception e) {
            log.error("Error retrieving overdue milestones for contract {}: {}",
                    contractId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to retrieve overdue milestones: " + e.getMessage()));
        }
    }

    /**
     * Manually triggers milestone progress tracking update. This endpoint can
     * be used for administrative purposes or scheduled tasks.
     *
     * @return success response
     */
    @PostMapping("/update-progress")
    public ResponseEntity<ApiResponse<String>> updateMilestoneProgressTracking() {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);

            // Only allow clients and freelancers to trigger this (could be restricted further)
            if (!"CLIENT".equals(userType) && !"FREELANCER".equals(userType)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied"));
            }

            milestoneService.updateMilestoneProgressTracking();

            log.info("Milestone progress tracking updated by user {}", userDetails.getProfileId());

            return ResponseEntity.ok(ApiResponse.success("Milestone progress tracking updated"));

        } catch (Exception e) {
            log.error("Error updating milestone progress tracking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update milestone progress tracking: " + e.getMessage()));
        }
    }

    /**
     * Sends a custom milestone notification to the contract chat.
     *
     * @param contractId the ID of the contract
     * @param request the notification request containing the message
     * @return success response
     */
    @PostMapping("/contract/{contractId}/notify")
    public ResponseEntity<ApiResponse<String>> sendMilestoneNotification(
            @PathVariable Long contractId,
            @RequestBody Map<String, String> request) {

        try {
            AppUserDetails userDetails = getCurrentUserDetails();

            String notification = request.get("notification");
            if (notification == null || notification.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Notification message is required"));
            }

            // Create a detailed notification message with emoji
            StringBuilder notificationMsg = new StringBuilder();
            notificationMsg.append("📢 **Milestone Update**\n");
            notificationMsg.append(notification);

            // Find the contract chat room
            Optional<ChatRoom> contractChatOpt = chatRoomRepository.findByChatTypeAndReferenceId(
                    ChatRoom.ChatType.CONTRACT, contractId);

            if (contractChatOpt.isPresent()) {
                ChatRoom contractChat = contractChatOpt.get();

                // Send the notification
                chatService.sendSystemNotification(
                        contractChat.getId(),
                        notificationMsg.toString(),
                        ChatMessage.MessageType.MILESTONE_UPDATE
                );

                log.info("Custom milestone notification sent for contract {} by user {}: {}",
                        contractId, userDetails.getProfileId(), notification);

                return ResponseEntity.ok(ApiResponse.success("Milestone notification sent successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Contract chat not found for contract ID: " + contractId));
            }

        } catch (Exception e) {
            log.error("Error sending milestone notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to send milestone notification: " + e.getMessage()));
        }
    }

    /**
     * Gets the current authenticated user details.
     *
     * @return the current user details
     * @throws RuntimeException if user is not authenticated
     */
    private AppUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AppUserDetails)) {
            throw new RuntimeException("User not authenticated");
        }

        return (AppUserDetails) authentication.getPrincipal();
    }

    /**
     * Determines the user type based on user authorities.
     *
     * @param userDetails the user details
     * @return "CLIENT" or "FREELANCER"
     */
    private String getUserType(AppUserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(Role.ROLE_CLIENT.toString()))
                ? "CLIENT" : "FREELANCER";
    }
}
