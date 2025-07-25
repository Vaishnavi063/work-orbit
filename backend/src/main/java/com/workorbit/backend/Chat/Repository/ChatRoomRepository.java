package com.workorbit.backend.Chat.Repository;

import com.workorbit.backend.Chat.Entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    // Find chat rooms by client ID
    List<ChatRoom> findByClient_IdOrderByUpdatedAtDesc(Long clientId);
    
    // Find chat rooms by freelancer ID
    List<ChatRoom> findByFreelancer_IdOrderByUpdatedAtDesc(Long freelancerId);
    
    // Find chat room by type and reference ID
    Optional<ChatRoom> findByChatTypeAndReferenceId(ChatRoom.ChatType chatType, Long referenceId);
    
    // Find chat rooms by client ID and status
    List<ChatRoom> findByClient_IdAndStatusOrderByUpdatedAtDesc(Long clientId, ChatRoom.ChatStatus status);
    
    // Find chat rooms by freelancer ID and status
    List<ChatRoom> findByFreelancer_IdAndStatusOrderByUpdatedAtDesc(Long freelancerId, ChatRoom.ChatStatus status);
    
    // Find chat rooms by chat type for a client
    List<ChatRoom> findByClient_IdAndChatTypeOrderByUpdatedAtDesc(Long clientId, ChatRoom.ChatType chatType);
    
    // Find chat rooms by chat type for a freelancer
    List<ChatRoom> findByFreelancer_IdAndChatTypeOrderByUpdatedAtDesc(Long freelancerId, ChatRoom.ChatType chatType);
    
    // Custom query to find all chat rooms for a user (client or freelancer)
    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "(cr.client.id = :userId AND :userType = 'CLIENT') OR " +
           "(cr.freelancer.id = :userId AND :userType = 'FREELANCER') " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findUserChatRooms(@Param("userId") Long userId, @Param("userType") String userType);
    
    // Custom query to find active chat rooms for a user with unread message count
    @Query("SELECT cr FROM ChatRoom cr LEFT JOIN cr.messages m WHERE " +
           "((cr.client.id = :userId AND :userType = 'CLIENT') OR " +
           "(cr.freelancer.id = :userId AND :userType = 'FREELANCER')) AND " +
           "cr.status = 'ACTIVE' " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findActiveChatRoomsForUser(@Param("userId") Long userId, @Param("userType") String userType);
    
    // Check if a chat room exists between specific client and freelancer for a reference
    boolean existsByClient_IdAndFreelancer_IdAndChatTypeAndReferenceId(
        Long clientId, Long freelancerId, ChatRoom.ChatType chatType, Long referenceId);
        
    /**
     * Convert a bid negotiation chat to a contract chat
     * @param chatRoomId The ID of the chat room to convert
     * @param contractId The ID of the new contract
     * @param originalBidId The ID of the original bid
     * @return The number of rows affected
     */
    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom cr SET cr.chatType = 'CONTRACT', cr.referenceId = :contractId, " +
           "cr.originalBidId = :originalBidId WHERE cr.id = :chatRoomId")
    int convertBidChatToContractChat(@Param("chatRoomId") Long chatRoomId, 
                                    @Param("contractId") Long contractId,
                                    @Param("originalBidId") Long originalBidId);
    
    /**
     * Close a chat room by setting its status to CLOSED
     * @param chatRoomId The ID of the chat room to close
     * @return The number of rows affected
     */
    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom cr SET cr.status = 'CLOSED' WHERE cr.id = :chatRoomId")
    int closeChatRoom(@Param("chatRoomId") Long chatRoomId);
    
    /**
     * Find chat rooms by original bid ID
     * @param originalBidId The original bid ID
     * @return List of chat rooms
     */
    List<ChatRoom> findByOriginalBidId(Long originalBidId);
    
    /**
     * Find active chat rooms with unread messages for a user
     * @param userId The user ID
     * @param userType The user type (CLIENT or FREELANCER)
     * @return List of chat rooms
     */
    @Query("SELECT DISTINCT cr FROM ChatRoom cr JOIN cr.messages m WHERE " +
           "((cr.client.id = :userId AND :userType = 'CLIENT' AND m.senderType = 'FREELANCER') OR " +
           "(cr.freelancer.id = :userId AND :userType = 'FREELANCER' AND m.senderType = 'CLIENT')) AND " +
           "cr.status = 'ACTIVE' AND m.isRead = false " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findActiveChatRoomsWithUnreadMessages(@Param("userId") Long userId, @Param("userType") String userType);
    
    /**
     * Find contract chat rooms that should be archived
     * These are chat rooms for contracts that have been marked for archiving
     * and have not been updated for a specified period
     * 
     * @param cutoffDate The date before which chat rooms should be archived
     * @return List of chat rooms to archive
     */
    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "cr.chatType = 'CONTRACT' AND " +
           "cr.status = 'ACTIVE' AND " +
           "cr.updatedAt < :cutoffDate")
    List<ChatRoom> findContractChatsToArchive(@Param("cutoffDate") LocalDateTime cutoffDate);
}
