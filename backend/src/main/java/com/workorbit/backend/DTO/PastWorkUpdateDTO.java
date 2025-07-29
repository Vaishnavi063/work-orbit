package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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
        description = "Flag to indicate if this past work item should be deleted. Set to true to remove the item from portfolio",
        example = "false",
        defaultValue = "false"
    )
    private Boolean toDelete;
}