package com.workorbit.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PastWorkUpdateDTO {
    private Long id;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Link cannot be blank")
    private String link;

    @NotBlank(message = "Description cannot be blank")
    private String description;
    
    private Boolean toDelete;
}