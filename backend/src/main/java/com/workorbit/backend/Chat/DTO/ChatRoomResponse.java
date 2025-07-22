package com.workorbit.backend.Chat.DTO;

import com.workorbit.backend.Chat.Entity.ChatRoom.ChatStatus;
import com.workorbit.backend.Chat.Entity.ChatRoom.ChatType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ChatRoomResponse {
    
    private Long id;
    private ChatType chatType;
    private Long referenceId;
    private OtherParty otherParty;
    private ChatMessageResponse lastMessage;
    private Long unreadCount;
    private ChatStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtherParty {
        private Long id;
        private String name;
        private String type; // CLIENT or FREELANCER
    }
}