package com.workorbit.backend.Chat.Controller;

import com.workorbit.backend.Auth.DTO.AppUserDetails;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Chat.DTO.*;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.DTO.MilestoneRequest;
import com.workorbit.backend.Chat.DTO.MilestoneResponse;
import com.workorbit.backend.Chat.DTO.MilestoneStatusRequest;
import com.workorbit.backend.Chat.Enum.MilestoneStatus;
import com.workorbit.backend.Chat.Service.MilestoneService;
import com.workorbit.backend.Chat.Exception.ChatAccessDeniedException;
import com.workorbit.backend.Chat.Exception.ChatRoomNotFoundException;
import com.workorbit.backend.Chat.Exception.ChatTransitionException;
import com.workorbit.backend.Chat.Exception.InvalidChatOperationException;
import com.workorbit.backend.Chat.Service.ChatService;
import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Service.bid.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing chat operations including message sending,
 * chat history retrieval, and real-time communication setup.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final BidService bidService;
    private final MilestoneService milestoneService;

    /**
     * Sends a message in a chat room.
     * 
     * @param request the message request containing chat room ID and content
     * @return the created message response with actual message ID
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            ChatMessageResponse response = chatService.sendMessage(
                request, userDetails.getProfileId(), userType);
            
            log.info("Message sent successfully by user {} in chat room {} with ID {}", 
                userDetails.getProfileId(), request.getChatRoomId(), response.getId());
            
            // Return the actual message ID immediately for client-side tracking
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
                
        } catch (ChatRoomNotFoundException e) {
            log.error("Chat room not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (ChatAccessDeniedException e) {
            log.error("Access denied to chat room: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }

    /**
     * Retrieves chat history for a specific chat room with pagination.
     * 
     * @param chatRoomId the ID of the chat room
     * @param pageable pagination parameters
     * @return paginated list of chat messages
     */
    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getChatHistory(
            @PathVariable Long chatRoomId,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            Page<ChatMessageResponse> messages = chatService.getChatHistory(
                chatRoomId, pageable, userDetails.getProfileId(), userType);
            
            log.info("Retrieved {} messages for chat room {} by user {}", 
                messages.getNumberOfElements(), chatRoomId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(messages));
            
        } catch (ChatRoomNotFoundException | ChatAccessDeniedException e) {
            log.error("Access error retrieving chat history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving chat history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve chat history: " + e.getMessage()));
        }
    }
    
    /**
     * Retrieves new messages since a specific timestamp for polling.
     * 
     * @param chatRoomId the ID of the chat room
     * @param since the timestamp to retrieve messages from
     * @return list of new messages since the specified timestamp
     */
    @GetMapping("/rooms/{chatRoomId}/messages/since")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getNewMessages(
            @PathVariable Long chatRoomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            List<ChatMessageResponse> newMessages = chatService.getNewMessages(
                chatRoomId, since, userDetails.getProfileId(), userType);
            
            log.info("Retrieved {} new messages for chat room {} by user {} since {}", 
                newMessages.size(), chatRoomId, userDetails.getProfileId(), since);
            
            return ResponseEntity.ok(ApiResponse.success(newMessages));
            
        } catch (ChatRoomNotFoundException | ChatAccessDeniedException e) {
            log.error("Access error retrieving new messages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving new messages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve new messages: " + e.getMessage()));
        }
    }

    /**
     * Retrieves all chat rooms for the current user.
     * 
     * @return list of chat rooms with metadata
     */
    @GetMapping("/rooms/user")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getUserChatRooms() {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            List<ChatRoomResponse> chatRooms = chatService.getUserChatRooms(
                userDetails.getProfileId(), userType);
            
            log.info("Retrieved {} chat rooms for user {}", 
                chatRooms.size(), userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(chatRooms));
            
        } catch (Exception e) {
            log.error("Error retrieving user chat rooms: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve chat rooms: " + e.getMessage()));
        }
    }

    /**
     * Retrieves active chat rooms for the current user.
     * 
     * @return list of active chat rooms
     */
    @GetMapping("/rooms/active")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getActiveChatRooms() {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            List<ChatRoomResponse> activeChatRooms = chatService.getActiveChatRooms(
                userDetails.getProfileId(), userType);
            
            log.info("Retrieved {} active chat rooms for user {}", 
                activeChatRooms.size(), userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(activeChatRooms));
            
        } catch (Exception e) {
            log.error("Error retrieving active chat rooms: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve active chat rooms: " + e.getMessage()));
        }
    }

    /**
     * Marks all unread messages in a chat room as read.
     * 
     * @param chatRoomId the ID of the chat room
     * @return success response with count of messages marked as read
     */
    @PostMapping("/rooms/{chatRoomId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            int markedCount = chatService.markMessagesAsRead(
                chatRoomId, userDetails.getProfileId(), userType);
            
            log.info("Marked {} messages as read in chat room {} for user {}", 
                markedCount, chatRoomId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(
                "Marked " + markedCount + " messages as read"));
                
        } catch (Exception e) {
            log.error("Error marking messages as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to mark messages as read: " + e.getMessage()));
        }
    }

    /**
     * Creates or retrieves a chat room for bid negotiation.
     * 
     * @param request the bid chat room creation request
     * @return the chat room response
     */
    @PostMapping("/rooms/bid")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createBidChatRoom(
            @RequestBody Map<String, Long> request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            Long bidId = request.get("bidId");
            if (bidId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Bid ID is required"));
            }
            
            ChatRoom chatRoom = chatService.createBidNegotiationChat(bidId);
            ChatRoomResponse response = chatService.getChatRoomResponse(chatRoom, userDetails.getProfileId(), userType);
            
            log.info("Bid chat room created/retrieved for bid {} by user {}", bidId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Error creating bid chat room: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to create bid chat room: " + e.getMessage()));
        }
    }

    /**
     * Creates or retrieves a chat room for contract management.
     * 
     * @param request the contract chat room creation request
     * @return the chat room response
     */
    @PostMapping("/rooms/contract")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createContractChatRoom(
            @RequestBody Map<String, Long> request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            Long contractId = request.get("contractId");
            if (contractId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Contract ID is required"));
            }
            
            ChatRoom chatRoom = chatService.createContractChat(contractId);
            ChatRoomResponse response = chatService.getChatRoomResponse(chatRoom, userDetails.getProfileId(), userType);
            
            log.info("Contract chat room created/retrieved for contract {} by user {}", contractId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Error creating contract chat room: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to create contract chat room: " + e.getMessage()));
        }
    }



    /**
     * Accepts a bid through the chat interface and transitions the chat to contract mode.
     * 
     * @param bidId the ID of the bid to accept
     * @return success response with chat transition details
     */
    @PostMapping("/bid/{bidId}/accept")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> acceptBidInChat(@PathVariable Long bidId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate that only clients can accept bids
            if (!"CLIENT".equals(userType)) {
                throw new ChatAccessDeniedException("Only clients can accept bids");
            }
            
            // Delegate to BidService for bid acceptance
            Long contractId = bidService.acceptBid(bidId, userDetails.getProfileId());
            
            // Convert the bid chat to contract chat
            ChatRoom contractChatRoom = chatService.convertToContractChat(bidId, contractId);
            
            // Get the updated chat room response
            ChatRoomResponse chatRoomResponse = chatService.getChatRoomResponse(
                contractChatRoom, userDetails.getProfileId(), userType);
            
            log.info("Bid {} accepted by client {} and chat transitioned to contract chat {}", 
                bidId, userDetails.getProfileId(), contractChatRoom.getId());
            
            return ResponseEntity.ok(ApiResponse.success(chatRoomResponse));
            
        } catch (ChatAccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (ChatTransitionException e) {
            log.error("Chat transition error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error accepting bid: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to accept bid: " + e.getMessage()));
        }
    }

    /**
     * Rejects a bid through the chat interface and closes the chat.
     * 
     * @param bidId the ID of the bid to reject
     * @return success response with chat closure confirmation
     */
    @PostMapping("/bid/{bidId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectBidInChat(@PathVariable Long bidId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate that only clients can reject bids
            if (!"CLIENT".equals(userType)) {
                throw new ChatAccessDeniedException("Only clients can reject bids");
            }
            
            // Delegate to BidService for bid rejection
            bidService.rejectBid(bidId, userDetails.getProfileId());
            
            // Close the bid chat
            chatService.closeBidChat(bidId);
            
            log.info("Bid {} rejected by client {} and chat closed", 
                bidId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success("Bid rejected and chat closed successfully"));
            
        } catch (ChatAccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        } catch (ChatRoomNotFoundException e) {
            log.error("Chat room not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (InvalidChatOperationException e) {
            log.error("Invalid chat operation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error rejecting bid: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to reject bid: " + e.getMessage()));
        }
    }

    /**
     * Gets bid details for a bid negotiation chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @return bid details response
     */
    @GetMapping("/rooms/{chatRoomId}/bid-details")
    public ResponseEntity<ApiResponse<BidDetailsResponse>> getBidDetailsForChat(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            BidDetailsResponse bidDetails = chatService.getBidDetailsForChat(
                chatRoomId, userDetails.getProfileId(), userType);
            
            log.info("Retrieved bid details for chat room {} by user {}", 
                chatRoomId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(bidDetails));
            
        } catch (Exception e) {
            log.error("Error retrieving bid details for chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve bid details: " + e.getMessage()));
        }
    }

    /**
     * Gets contract details for a contract chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @return contract details response
     */
    @GetMapping("/rooms/{chatRoomId}/contract-details")
    public ResponseEntity<ApiResponse<ContractDetailsResponse>> getContractDetailsForChat(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            ContractDetailsResponse contractDetails = chatService.getContractDetailsForChat(
                chatRoomId, userDetails.getProfileId(), userType);
            
            log.info("Retrieved contract details for chat room {} by user {}", 
                chatRoomId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(contractDetails));
            
        } catch (Exception e) {
            log.error("Error retrieving contract details for chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve contract details: " + e.getMessage()));
        }
    }
    
    /**
     * Gets milestone details for a contract chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @return list of milestone responses
     */
    @GetMapping("/rooms/{chatRoomId}/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getMilestonesForChat(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestones are only available in contract chats"));
            }
            
            // Get contract ID from chat room
            Long contractId = chatRoom.getReferenceId();
            
            // Get milestones for the contract
            List<MilestoneResponse> milestones = milestoneService.getContractMilestones(contractId);
            
            log.info("Retrieved {} milestones for chat room {} (contract {}) by user {}", 
                milestones.size(), chatRoomId, contractId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(milestones));
            
        } catch (Exception e) {
            log.error("Error retrieving milestones for chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve milestones: " + e.getMessage()));
        }
    }
    
    /**
     * Gets milestone completion percentage for a contract chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @return completion percentage (0-100)
     */
    @GetMapping("/rooms/{chatRoomId}/milestone-completion")
    public ResponseEntity<ApiResponse<Double>> getMilestoneCompletionForChat(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestones are only available in contract chats"));
            }
            
            // Get contract ID from chat room
            Long contractId = chatRoom.getReferenceId();
            
            // Get completion percentage for the contract
            Double completionPercentage = milestoneService.getContractCompletionPercentage(contractId);
            
            log.info("Retrieved milestone completion percentage {}% for chat room {} (contract {}) by user {}", 
                completionPercentage, chatRoomId, contractId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(completionPercentage));
            
        } catch (Exception e) {
            log.error("Error retrieving milestone completion percentage for chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve milestone completion percentage: " + e.getMessage()));
        }
    }
    
    /**
     * Gets overdue milestones for a contract chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @return list of overdue milestone responses
     */
    @GetMapping("/rooms/{chatRoomId}/overdue-milestones")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getOverdueMilestonesForChat(@PathVariable Long chatRoomId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestones are only available in contract chats"));
            }
            
            // Get contract ID from chat room
            Long contractId = chatRoom.getReferenceId();
            
            // Get overdue milestones for the contract
            List<MilestoneResponse> overdueMilestones = milestoneService.getOverdueMilestones(contractId);
            
            log.info("Retrieved {} overdue milestones for chat room {} (contract {}) by user {}", 
                overdueMilestones.size(), chatRoomId, contractId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(overdueMilestones));
            
        } catch (Exception e) {
            log.error("Error retrieving overdue milestones for chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve overdue milestones: " + e.getMessage()));
        }
    }
    
    /**
     * Sends a milestone-related notification to a contract chat.
     * This endpoint allows direct milestone notifications from the frontend.
     * 
     * @param chatRoomId the ID of the chat room
     * @param request the notification request containing the message
     * @return success response
     */
    @PostMapping("/rooms/{chatRoomId}/milestone-notification")
    public ResponseEntity<ApiResponse<String>> sendMilestoneNotification(
            @PathVariable Long chatRoomId,
            @RequestBody Map<String, String> request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestone notifications can only be sent in contract chats"));
            }
            
            String notification = request.get("notification");
            if (notification == null || notification.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Notification message is required"));
            }
            
            // Send the milestone notification
            chatService.sendSystemNotification(chatRoomId, notification, ChatMessage.MessageType.MILESTONE_UPDATE);
            
            log.info("Milestone notification sent to chat room {} by user {}: {}", 
                chatRoomId, userDetails.getProfileId(), notification);
            
            return ResponseEntity.ok(ApiResponse.success("Milestone notification sent successfully"));
            
        } catch (Exception e) {
            log.error("Error sending milestone notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to send milestone notification: " + e.getMessage()));
        }
    }
    
    /**
     * Creates a milestone directly from the chat interface.
     * 
     * @param chatRoomId the ID of the chat room
     * @param request the milestone creation request
     * @return the created milestone response
     */
    @PostMapping("/rooms/{chatRoomId}/create-milestone")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestoneFromChat(
            @PathVariable Long chatRoomId,
            @Valid @RequestBody MilestoneRequest request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestones can only be created in contract chats"));
            }
            
            // Get contract ID from chat room
            Long contractId = chatRoom.getReferenceId();
            
            // Create the milestone
            MilestoneResponse response = milestoneService.createMilestone(contractId, request);
            
            log.info("Milestone created from chat room {} for contract {} by user {}: {}", 
                chatRoomId, contractId, userDetails.getProfileId(), response.getTitle());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
                
        } catch (Exception e) {
            log.error("Error creating milestone from chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to create milestone: " + e.getMessage()));
        }
    }
    
    /**
     * Updates a milestone status directly from the chat interface.
     * 
     * @param chatRoomId the ID of the chat room
     * @param milestoneId the ID of the milestone
     * @param request the milestone status update request
     * @return the updated milestone response
     */
    @PutMapping("/rooms/{chatRoomId}/milestones/{milestoneId}/status")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestoneStatusFromChat(
            @PathVariable Long chatRoomId,
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneStatusRequest request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate chat room access
            ChatRoom chatRoom = chatService.findChatRoomById(chatRoomId, userDetails.getProfileId(), userType);
            
            // Validate that this is a contract chat
            if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Milestones can only be updated in contract chats"));
            }
            
            // Update the milestone status
            MilestoneResponse response = milestoneService.updateMilestoneStatus(milestoneId, request.getStatus());
            
            log.info("Milestone {} status updated to {} from chat room {} by user {}", 
                milestoneId, request.getStatus(), chatRoomId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Error updating milestone status from chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to update milestone status: " + e.getMessage()));
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
        
        if (authentication == null || !authentication.isAuthenticated() || 
            !(authentication.getPrincipal() instanceof AppUserDetails)) {
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