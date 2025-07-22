package com.workorbit.backend.Chat.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
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
    
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private LocalDateTime dueDate;
}