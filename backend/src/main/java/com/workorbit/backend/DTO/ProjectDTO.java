package com.workorbit.backend.DTO;

import com.workorbit.backend.Entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Project data transfer object containing all project information")
public class ProjectDTO {
    
    @Schema(description = "Unique identifier for the project", example = "1")
    private Long id;
    
    @Schema(description = "Project title", example = "E-commerce Website Development", required = true)
    private String title;
    
    @Schema(description = "Detailed project description", 
            example = "Looking for a skilled developer to build a modern e-commerce website with payment integration", 
            required = true)
    private String description;
    
    @Schema(description = "Project category", example = "Web Development", required = true)
    private String category;
    
    @Schema(description = "Project deadline", example = "2024-12-31T23:59:59", required = true)
    private LocalDateTime deadline;
    
    @Schema(description = "Project budget in cents", example = "500000", required = true)
    private Long budget;
    
    @Schema(description = "Current project status", example = "OPEN", allowableValues = {"OPEN", "CLOSED"})
    private Project.ProjectStatus status;
    
    @Schema(description = "Client information who posted the project")
    private ClientDTO client;
    
    @Schema(description = "ID of the client who posted the project", example = "1")
    private Long clientId;
    
    @Schema(description = "Timestamp when the project was created", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Timestamp when the project was last updated", example = "2024-01-16T14:20:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Total number of bids received for this project", example = "5")
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