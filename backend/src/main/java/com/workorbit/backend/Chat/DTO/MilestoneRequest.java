package com.workorbit.backend.Chat.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class MilestoneRequest {
    
    @NotBlank(message = "Milestone title is required")
    private String title;
    
    private String description;
    
    private LocalDateTime dueDate;
}