package com.workorbit.backend.DTO;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerDTO {
    private String name;
    private String email;
    private Double rating;
    private List<String> skills;
    private List<PastWorkDTO> pastWorks;

}

