package com.workorbit.backend.Chat.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_room_created_at", columnList = "chat_room_id, created_at"),
    @Index(name = "idx_sender_type_sender_id", columnList = "sender_type, sender_id"),
    @Index(name = "idx_is_read", columnList = "is_read")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private SenderType senderType;

    @Column(name = "sender_id")
    private Long senderId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum SenderType {
        CLIENT,
        FREELANCER,
        SYSTEM
    }

    public enum MessageType {
        TEXT,
        SYSTEM_NOTIFICATION,
        BID_ACTION,
        MILESTONE_UPDATE
    }
}