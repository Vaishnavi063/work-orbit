package com.workorbit.backend.Chat.DTO;

import com.workorbit.backend.Chat.Entity.ChatMessage.MessageType;
import com.workorbit.backend.Chat.Entity.ChatMessage.SenderType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ChatMessageResponse {
    
    private Long id;
    private Long chatRoomId;
    private SenderType senderType;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageType messageType;
    private boolean isRead;
    private LocalDateTime createdAt;
}