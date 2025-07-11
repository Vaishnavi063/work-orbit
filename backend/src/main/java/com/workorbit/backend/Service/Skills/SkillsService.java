package com.workorbit.backend.Service.Skills;

import com.workorbit.backend.DTO.SkillDTO;
import com.workorbit.backend.Entity.Skills;

import java.util.List;

public interface SkillsService {
    Skills addSkill(SkillDTO dto);
    List<Skills> getSkillsByFreelancerId(Long freelancerId);
    void removeSkillFromFreelancer(Long freelancerId, String skillName);
}
