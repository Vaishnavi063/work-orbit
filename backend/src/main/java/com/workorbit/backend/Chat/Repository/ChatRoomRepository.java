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

    Optional<ChatRoom> findByChatTypeAndReferenceId(ChatRoom.ChatType chatType, Long referenceId);

    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "(cr.client.id = :userId AND :userType = 'CLIENT') OR " +
           "(cr.freelancer.id = :userId AND :userType = 'FREELANCER') " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findUserChatRooms(@Param("userId") Long userId, @Param("userType") String userType);
    
    @Query("SELECT cr FROM ChatRoom cr LEFT JOIN cr.messages m WHERE " +
           "((cr.client.id = :userId AND :userType = 'CLIENT') OR " +
           "(cr.freelancer.id = :userId AND :userType = 'FREELANCER')) AND " +
           "cr.status = 'ACTIVE' " +
           "ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findActiveChatRoomsForUser(@Param("userId") Long userId, @Param("userType") String userType);

    @Query("SELECT cr FROM ChatRoom cr WHERE " +
           "cr.chatType = 'CONTRACT' AND " +
           "cr.status = 'ACTIVE' AND " +
           "cr.updatedAt < :cutoffDate")
    List<ChatRoom> findContractChatsToArchive(@Param("cutoffDate") LocalDateTime cutoffDate);
}
