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
    
    Page<ChatMessage> findByChatRoom_IdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE " +
           "cm.chatRoom.id = :chatRoomId AND " +
           "cm.isRead = false AND " +
           "((cm.senderType = 'CLIENT' AND :userType = 'FREELANCER') OR " +
           "(cm.senderType = 'FREELANCER' AND :userType = 'CLIENT') OR " +
           "cm.senderType = 'SYSTEM')")
    Long countUnreadMessagesForUser(@Param("chatRoomId") Long chatRoomId, @Param("userType") String userType);

    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.id = :chatRoomId " +
           "ORDER BY cm.createdAt DESC LIMIT 1")
    ChatMessage findLatestMessageInChatRoom(@Param("chatRoomId") Long chatRoomId);
    
    List<ChatMessage> findByChatRoom_IdAndCreatedAtAfterOrderByCreatedAtAsc(
        Long chatRoomId, LocalDateTime timestamp);
    
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true WHERE " +
           "cm.chatRoom.id = :chatRoomId AND " +
           "cm.isRead = false AND " +
           "((cm.senderType = 'CLIENT' AND :userType = 'FREELANCER') OR " +
           "(cm.senderType = 'FREELANCER' AND :userType = 'CLIENT') OR " +
           "cm.senderType = 'SYSTEM')")
    int markMessagesAsReadForUser(@Param("chatRoomId") Long chatRoomId, @Param("userType") String userType);
}