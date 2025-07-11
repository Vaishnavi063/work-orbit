package com.workorbit.backend.DTO;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDTO {
    private String skillName;
    private Long freelancerId;
}
