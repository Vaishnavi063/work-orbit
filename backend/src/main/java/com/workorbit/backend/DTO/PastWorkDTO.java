package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDate;

@Data
@Schema(description = "Past work or portfolio item of a freelancer with optional timeline information")
public class PastWorkDTO {
    
    @Schema(
        description = "Unique identifier of the past work item",
        example = "1",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;
    
    @Schema(
        description = "Title or name of the project/work",
        example = "E-commerce Website Development",
        required = true
    )
    private String title;
    
    @Schema(
        description = "URL link to the project, portfolio, or demo",
        example = "https://github.com/johnsmith/ecommerce-project",
        required = true
    )
    private String link;
    
    @Schema(
        description = "Detailed description of the project, technologies used, and achievements",
        example = "Developed a full-stack e-commerce platform using Spring Boot and React. Implemented payment integration, user authentication, and inventory management.",
        required = true
    )
    private String description;
    
    @Schema(
        description = "Start date of the project or work period",
        example = "2023-01-15",
        required = false
    )
    private LocalDate startDate;
    
    @Schema(
        description = "End date of the project or work period. If null, the project is considered ongoing",
        example = "2023-06-30",
        required = false
    )
    private LocalDate endDate;
    
    /**
     * Computed method to determine if the project is currently ongoing
     * @return true if the project has a start date but no end date, false otherwise
     */
    @Schema(
        description = "Indicates whether the project is currently ongoing (has start date but no end date)",
        example = "false",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    public boolean isOngoing() {
        return startDate != null && endDate == null;
    }
}
