package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.*;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service interface for managing chat operations including room creation,
 * message handling, and real-time communication integration.
 */
public interface ChatService {

    @Transactional
    ChatRoom createBidNegotiationChat(Long bidId);
    
    /**
     * Creates a chat room for contract management between client and freelancer.
     * 
     * @param contractId the ID of the contract
     * @return the created ChatRoom entity
     */
    ChatRoom createContractChat(Long contractId);
    
    /**
     * Sends a message in a chat room and publishes it to Ably for real-time delivery.
     * 
     * @param request the message request containing chat room ID and content
     * @param userId the ID of the user sending the message
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return the created ChatMessageResponse
     */
    ChatMessageResponse sendMessage(ChatMessageRequest request, Long userId, String userType);
    
    /**
     * Retrieves chat history for a specific chat room with pagination.
     * 
     * @param chatRoomId the ID of the chat room
     * @param pageable pagination parameters
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return paginated list of chat messages
     */
    Page<ChatMessageResponse> getChatHistory(Long chatRoomId, Pageable pageable, Long userId, String userType);
    
    /**
     * Marks all unread messages in a chat room as read for the specified user.
     * 
     * @param chatRoomId the ID of the chat room
     * @param userId the ID of the user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return the number of messages marked as read
     */
    int markMessagesAsRead(Long chatRoomId, Long userId, String userType);
    
    /**
     * Retrieves all chat rooms for a specific user.
     * 
     * @param userId the ID of the user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return list of chat rooms with metadata
     */
    List<ChatRoomResponse> getUserChatRooms(Long userId, String userType);
    
    /**
     * Retrieves active chat rooms for a specific user.
     * 
     * @param userId the ID of the user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return list of active chat rooms
     */
    List<ChatRoomResponse> getActiveChatRooms(Long userId, String userType);
    
    /**
     * Generates an Ably authentication token for real-time messaging.
     * 
     * @param request the token request containing channel information
     * @param userId the ID of the requesting user
     * @return Ably token response
     */
    AblyTokenResponse getAblyToken(AblyTokenRequest request, Long userId);
    
    /**
     * Finds a chat room by its ID and validates user access.
     * 
     * @param chatRoomId the ID of the chat room
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return the ChatRoom entity
     */
    ChatRoom findChatRoomById(Long chatRoomId, Long userId, String userType);
    
    /**
     * Sends a system notification to a chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @param notification the notification message
     */
    void sendSystemNotification(Long chatRoomId, String notification);
}