package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    description = "Response containing project count for a specific category",
    example = """
        {
          "category": "Web Development",
          "categoryId": 1,
          "activeProjectCount": 15,
          "lastUpdated": "2025-01-08T10:30:00"
        }
        """
)
public class ProjectCountResponse {
    
    @Schema(
        description = "Category name for which the count is provided",
        example = "Web Development",
        required = true
    )
    private String category;
    
    @Schema(
        description = "Category ID for which the count is provided",
        example = "1",
        required = true
    )
    private Long categoryId;
    
    @Schema(
        description = "Number of active (OPEN status) projects in this category",
        example = "15",
        minimum = "0",
        required = true
    )
    private Long activeProjectCount;
    
    @Schema(
        description = "Timestamp when this count was last calculated",
        example = "2025-01-08T10:30:00",
        required = true
    )
    private LocalDateTime lastUpdated;
}