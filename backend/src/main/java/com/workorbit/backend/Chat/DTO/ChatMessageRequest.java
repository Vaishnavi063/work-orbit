package com.workorbit.backend.Chat.DTO;

import com.workorbit.backend.Chat.Entity.ChatMessage.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ChatMessageRequest {
    
    @NotNull(message = "Chat room ID is required")
    private Long chatRoomId;
    
    @NotBlank(message = "Message content cannot be empty")
    private String content;
    
    private MessageType messageType = MessageType.TEXT;
}