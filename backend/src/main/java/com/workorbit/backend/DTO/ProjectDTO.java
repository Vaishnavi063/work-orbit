package com.workorbit.backend.DTO;

import com.workorbit.backend.Entity.Project;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private LocalDateTime deadline;
    private Long budget;
    private Project.ProjectStatus status;
    private Long clientId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer bidCount;
}
