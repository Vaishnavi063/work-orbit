package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
@Schema(description = "Request object for updating or managing past work items in freelancer portfolio")
public class PastWorkUpdateDTO {
    
    @Schema(
        description = "Unique identifier of the past work item. Null for new items, required for updates",
        example = "1"
    )
    private Long id;

    @Schema(
        description = "Title or name of the project/work",
        example = "E-commerce Website Development",
        required = true
    )
    @NotBlank(message = "Title cannot be blank")
    private String title;

    @Schema(
        description = "URL link to the project, portfolio, or demo",
        example = "https://github.com/johnsmith/ecommerce-project",
        required = true
    )
    @NotBlank(message = "Link cannot be blank")
    private String link;

    @Schema(
        description = "Detailed description of the project, technologies used, and achievements",
        example = "Developed a full-stack e-commerce platform using Spring Boot and React. Implemented payment integration, user authentication, and inventory management.",
        required = true
    )
    @NotBlank(message = "Description cannot be blank")
    private String description;
    
    @Schema(
        description = "Start date of the project. Optional field to indicate when the work began",
        example = "2023-01-15",
        type = "string",
        format = "date"
    )
    private LocalDate startDate;

    @Schema(
        description = "End date of the project. Optional field to indicate when the work was completed. If null while startDate is provided, the project is considered ongoing",
        example = "2023-06-30",
        type = "string",
        format = "date"
    )
    private LocalDate endDate;
    
    @Schema(
        description = "Flag to indicate if this past work item should be deleted. Set to true to remove the item from portfolio",
        example = "false",
        defaultValue = "false"
    )
    private Boolean toDelete;

    @AssertTrue(message = "End date cannot be before start date")
    @Schema(hidden = true)
    private boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return !startDate.isAfter(endDate);
    }
}