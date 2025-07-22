package com.workorbit.backend.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class FreelancerUpdateDTO {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @Min(value = 0, message = "Rating must be non-negative")
    @Max(value = 5, message = "Rating cannot be greater than 5")
    private Double rating;

    @Valid // Cascade validation to past work objects
    private List<PastWorkUpdateDTO> pastWorks;

    private List<String> skills;
}