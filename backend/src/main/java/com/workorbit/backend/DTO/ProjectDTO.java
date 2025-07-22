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
    private ClientDTO client;
    private Long clientId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer bidCount;

    public ProjectDTO(Long id, String title, String description, String category,
                      LocalDateTime deadline, Long budget, Project.ProjectStatus status,
                      ClientDTO client, Long clientId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.deadline = deadline;
        this.budget = budget;
        this.status = status;
        this.client = client;
        this.clientId = clientId;
    }

    // ✅ Additional constructor for BidService (11 parameters - without bidCount)
    public ProjectDTO(Long id, String title, String description, String category,
                      LocalDateTime deadline, Long budget, Project.ProjectStatus status,
                      ClientDTO client, Long clientId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.deadline = deadline;
        this.budget = budget;
        this.status = status;
        this.client = client;
        this.clientId = clientId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}