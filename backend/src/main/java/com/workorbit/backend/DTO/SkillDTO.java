package com.workorbit.backend.DTO;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillDTO {
    private Long id;
    private String skillName;
    private Long freelancerId;
}
