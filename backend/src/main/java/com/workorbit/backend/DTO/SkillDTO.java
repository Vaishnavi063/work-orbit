package com.workorbit.backend.DTO;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillDTO {
    private Long id;
    private String skillName;
    private Long freelancerId;
}
