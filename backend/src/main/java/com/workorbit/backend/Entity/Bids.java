package com.workorbit.backend.Entity;
import com.fasterxml.jackson.annotation.JsonBackReference;
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

    @Column(nullable = false)
    private String proposal;
    @Column(nullable = false)
    private double bidAmount;
    @Column(nullable = false)
    private long durationDays;

    @Column(nullable = false)
    private Integer teamSize;

    @Enumerated(EnumType.STRING)
    private bidStatus status = bidStatus.Pending;

    public enum bidStatus{
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
    @JsonBackReference
    private Freelancer freelancer;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @OneToOne(mappedBy = "bid", cascade = CascadeType.ALL, orphanRemoval = true)
    private Contract contract;
}

