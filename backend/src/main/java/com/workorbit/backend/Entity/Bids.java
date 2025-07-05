package com.workorbit.backend.Entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Bids {
    @Id
    @GeneratedValue
    private Long id;

    private String proposal;
    private double bidAmount;
    private long durationDays;

    @Enumerated(EnumType.STRING)
    private bidStatus status = bidStatus.Pending;

    private enum bidStatus{
        Pending,
        Accepted,
        Rejected
    }

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}

