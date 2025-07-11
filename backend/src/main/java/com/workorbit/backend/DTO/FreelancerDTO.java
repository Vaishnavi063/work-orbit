package com.workorbit.backend.DTO;
import com.workorbit.backend.Entity.PastWork;
import com.workorbit.backend.Entity.Skills;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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

