package com.workorbit.backend.Chat.Repository;

import com.workorbit.backend.Chat.Entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Find messages by chat room ID with pagination (ordered by creation time descending for latest first)
    Page<ChatMessage> findByChatRoom_IdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);
    
    // Find messages by chat room ID ordered by creation time ascending (for chronological display)
    List<ChatMessage> findByChatRoom_IdOrderByCreatedAtAsc(Long chatRoomId);
    
    // Find unread messages for a specific chat room and user
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "cm.chatRoom.id = :chatRoomId AND " +
           "cm.isRead = false AND " +
           "((cm.senderType = 'CLIENT' AND :userType = 'FREELANCER') OR " +
           "(cm.senderType = 'FREELANCER' AND :userType = 'CLIENT') OR " +
           "cm.senderType = 'SYSTEM') " +
           "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findUnreadMessagesForUser(@Param("chatRoomId") Long chatRoomId, @Param("userType") String userType);
    
    // Count unread messages for a specific chat room and user
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE " +
           "cm.chatRoom.id = :chatRoomId AND " +
           "cm.isRead = false AND " +
           "((cm.senderType = 'CLIENT' AND :userType = 'FREELANCER') OR " +
           "(cm.senderType = 'FREELANCER' AND :userType = 'CLIENT') OR " +
           "cm.senderType = 'SYSTEM')")
    Long countUnreadMessagesForUser(@Param("chatRoomId") Long chatRoomId, @Param("userType") String userType);


    // Find messages by sender type and sender ID
    List<ChatMessage> findBySenderTypeAndSenderIdOrderByCreatedAtDesc(
        ChatMessage.SenderType senderType, Long senderId);
    
    // Find messages by message type in a chat room
    List<ChatMessage> findByChatRoom_IdAndMessageTypeOrderByCreatedAtDesc(
        Long chatRoomId, ChatMessage.MessageType messageType);
    
    // Find latest message in a chat room
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :chatRoomId " +
           "ORDER BY cm.createdAt DESC LIMIT 1")
    ChatMessage findLatestMessageInChatRoom(@Param("chatRoomId") Long chatRoomId);
    
    // Find messages created after a specific timestamp
    List<ChatMessage> findByChatRoom_IdAndCreatedAtAfterOrderByCreatedAtAsc(
        Long chatRoomId, LocalDateTime timestamp);
    
    // Mark messages as read for a specific chat room and user
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true WHERE " +
           "cm.chatRoom.id = :chatRoomId AND " +
           "cm.isRead = false AND " +
           "((cm.senderType = 'CLIENT' AND :userType = 'FREELANCER') OR " +
           "(cm.senderType = 'FREELANCER' AND :userType = 'CLIENT') OR " +
           "cm.senderType = 'SYSTEM')")
    int markMessagesAsReadForUser(@Param("chatRoomId") Long chatRoomId, @Param("userType") String userType);
    
    // Count total messages in a chat room
    Long countByChatRoom_Id(Long chatRoomId);
    
    // Find messages with pagination and filtering by message type
    Page<ChatMessage> findByChatRoom_IdAndMessageTypeOrderByCreatedAtDesc(
        Long chatRoomId, ChatMessage.MessageType messageType, Pageable pageable);
}