package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Past work or portfolio item of a freelancer")
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
}
