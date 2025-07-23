package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.*;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for managing chat operations including room creation,
 * message handling, and polling-based communication.
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
     * Sends a message in a chat room.
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
     * Retrieves new messages for a specific chat room since a given timestamp.
     * Used for polling-based message retrieval.
     * 
     * @param chatRoomId the ID of the chat room
     * @param since the timestamp to retrieve messages from
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return list of new chat messages
     */
    List<ChatMessageResponse> getNewMessages(Long chatRoomId, LocalDateTime since, Long userId, String userType);
    
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
    
    /**
     * Sends a system notification to a bid negotiation chat room.
     * 
     * @param bidId the ID of the bid
     * @param notification the notification message
     */
    void sendBidSystemNotification(Long bidId, String notification);
    
    /**
     * Converts a bid negotiation chat to contract chat when bid is accepted.
     * 
     * @param bidId the ID of the accepted bid
     * @param contractId the ID of the created contract
     * @return the updated ChatRoom entity
     */
    ChatRoom convertToContractChat(Long bidId, Long contractId);
    
    /**
     * Closes a bid chat when bid is rejected.
     * 
     * @param bidId the ID of the rejected bid
     */
    void closeBidChat(Long bidId);
    
    /**
     * Gets bid details for a bid negotiation chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return bid details response
     */
    BidDetailsResponse getBidDetailsForChat(Long chatRoomId, Long userId, String userType);
    
    /**
     * Gets contract details for a contract chat room.
     * 
     * @param chatRoomId the ID of the chat room
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return contract details response
     */
    ContractDetailsResponse getContractDetailsForChat(Long chatRoomId, Long userId, String userType);
    
    /**
     * Legacy method for transitioning a bid chat to contract chat.
     * 
     * @param bidId the ID of the accepted bid
     * @param contractId the ID of the created contract
     */
    void transitionBidChatToContract(Long bidId, Long contractId);
    
    /**
     * Converts a ChatRoom entity to ChatRoomResponse DTO.
     * 
     * @param chatRoom the ChatRoom entity
     * @param userId the ID of the requesting user
     * @param userType the type of user (CLIENT or FREELANCER)
     * @return chat room response DTO
     */
    ChatRoomResponse getChatRoomResponse(ChatRoom chatRoom, Long userId, String userType);
}