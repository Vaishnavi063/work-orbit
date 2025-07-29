
package com.workorbit.backend.Chat.Scheduler;

import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.Repository.ChatRoomRepository;
import com.workorbit.backend.Chat.Service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for handling scheduled tasks related to chat rooms.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatScheduler {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatService chatService;
    
    /**
     * Archives chat rooms for completed or cancelled contracts after a grace period.
     * Runs daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    @Transactional
    public void archiveCompletedContractChats() {
        log.info("Running scheduled task to archive completed contract chats");
        
        // Find active contract chat rooms with last update more than 7 days ago
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);
        
        List<ChatRoom> chatRoomsToArchive = chatRoomRepository.findContractChatsToArchive(cutoffDate);
        log.info("Found {} chat rooms to archive", chatRoomsToArchive.size());
        
        for (ChatRoom chatRoom : chatRoomsToArchive) {
            try {
                // Send final notification
                chatService.sendSystemNotification(chatRoom.getId(), 
                        "This chat room is now being archived as the contract has been completed or cancelled.");
                
                // Update status to ARCHIVED
                chatRoom.setStatus(ChatRoom.ChatStatus.ARCHIVED);
                chatRoomRepository.save(chatRoom);
                
                log.info("Successfully archived chat room: {}", chatRoom.getId());
            } catch (Exception e) {
                log.error("Failed to archive chat room: {}", chatRoom.getId(), e);
            }
        }
    }
    
    /**
     * Marks chat rooms as ARCHIVED for contracts that have been completed or cancelled.
     * This method can be called directly when a contract status changes.
     * 
     * @param contractId the ID of the completed or cancelled contract
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markContractChatForArchiving(Long contractId) {
        log.info("Marking contract chat for archiving: {}", contractId);
        
        try {
            // Find the chat room for this contract
            ChatRoom chatRoom = chatRoomRepository.findByChatTypeAndReferenceId(
                    ChatRoom.ChatType.CONTRACT, contractId)
                    .orElse(null);
            
            if (chatRoom == null) {
                log.warn("No chat room found for contract: {}", contractId);
                return;
            }
            
            // Send notification that chat will be archived soon
            chatService.sendSystemNotification(chatRoom.getId(), 
                    "This contract has been completed or cancelled. " +
                    "The chat room will be archived in 7 days.");
            
            log.info("Successfully marked chat room {} for archiving", chatRoom.getId());
        } catch (Exception e) {
            log.error("Failed to mark contract chat for archiving: {}", contractId, e);
            throw e; // Re-throw to ensure this separate transaction fails if needed
        }
    }
}
