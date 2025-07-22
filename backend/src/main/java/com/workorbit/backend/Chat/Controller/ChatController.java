package com.workorbit.backend.Chat.Controller;

import com.workorbit.backend.Auth.DTO.AppUserDetails;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Chat.DTO.*;
import com.workorbit.backend.Chat.Service.ChatService;
import com.workorbit.backend.DTO.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * Sends a message in a chat room.
     * 
     * @param request the message request containing chat room ID and content
     * @return the created message response
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            ChatMessageResponse response = chatService.sendMessage(
                request, userDetails.getProfileId(), userType);
            
            log.info("Message sent successfully by user {} in chat room {}", 
                userDetails.getProfileId(), request.getChatRoomId());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
                
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
            
        } catch (Exception e) {
            log.error("Error retrieving chat history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to retrieve chat history: " + e.getMessage()));
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
     * Generates an Ably authentication token for real-time messaging.
     * 
     * @param request the token request containing channel information
     * @return Ably token response
     */
    @PostMapping("/ably-token")
    public ResponseEntity<ApiResponse<AblyTokenResponse>> getAblyToken(
            @Valid @RequestBody AblyTokenRequest request) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            
            AblyTokenResponse tokenResponse = chatService.getAblyToken(
                request, userDetails.getProfileId());
            
            log.info("Generated Ably token for user {} with {} channels", 
                userDetails.getProfileId(), request.getChannels().length);
            
            return ResponseEntity.ok(ApiResponse.success(tokenResponse));
            
        } catch (Exception e) {
            log.error("Error generating Ably token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to generate Ably token: " + e.getMessage()));
        }
    }

    /**
     * Accepts a bid through the chat interface.
     * 
     * @param bidId the ID of the bid to accept
     * @return success response
     */
    @PostMapping("/bid/{bidId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptBidInChat(@PathVariable Long bidId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate that only clients can accept bids
            if (!"CLIENT".equals(userType)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only clients can accept bids"));
            }
            
            // TODO: Implement bid acceptance logic in ChatService or delegate to BidService
            // This will be implemented in task 9 when integrating with existing bid flows
            
            log.info("Bid {} accepted by client {} through chat", bidId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success("Bid accepted successfully"));
            
        } catch (Exception e) {
            log.error("Error accepting bid: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to accept bid: " + e.getMessage()));
        }
    }

    /**
     * Rejects a bid through the chat interface.
     * 
     * @param bidId the ID of the bid to reject
     * @return success response
     */
    @PostMapping("/bid/{bidId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectBidInChat(@PathVariable Long bidId) {
        
        try {
            AppUserDetails userDetails = getCurrentUserDetails();
            String userType = getUserType(userDetails);
            
            // Validate that only clients can reject bids
            if (!"CLIENT".equals(userType)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only clients can reject bids"));
            }
            
            // TODO: Implement bid rejection logic in ChatService or delegate to BidService
            // This will be implemented in task 9 when integrating with existing bid flows
            
            log.info("Bid {} rejected by client {} through chat", bidId, userDetails.getProfileId());
            
            return ResponseEntity.ok(ApiResponse.success("Bid rejected successfully"));
            
        } catch (Exception e) {
            log.error("Error rejecting bid: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to reject bid: " + e.getMessage()));
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