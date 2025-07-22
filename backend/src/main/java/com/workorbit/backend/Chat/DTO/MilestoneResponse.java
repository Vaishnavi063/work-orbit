package com.workorbit.backend.Chat.DTO;

import com.workorbit.backend.Chat.Entity.Milestone.MilestoneStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class MilestoneResponse {
    
    private Long id;
    private Long contractId;
    private String title;
    private String description;
    private BigDecimal amount;
    private LocalDateTime dueDate;
    private MilestoneStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}