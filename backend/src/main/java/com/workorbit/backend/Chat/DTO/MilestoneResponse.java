package com.workorbit.backend.Chat.DTO;

import com.workorbit.backend.Chat.Enum.MilestoneStatus;
import lombok.*;

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
    private LocalDateTime dueDate;
    private MilestoneStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}