package com.workorbit.backend.Chat.Entity;

import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
@Table(name = "chat_rooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"chat_type", "reference_id"})
})
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "chat_type", nullable = false)
    private ChatType chatType;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId; // bidId or contractId
    
    @Column(name = "original_bid_id")
    private Long originalBidId; // Stores original bid ID for reference after conversion

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatStatus status = ChatStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    public enum ChatType {
        BID_NEGOTIATION,
        CONTRACT
    }

    public enum ChatStatus {
        ACTIVE,
        COMPLETED,
        ARCHIVED,
        CLOSED
    }
}