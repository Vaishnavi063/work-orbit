package com.workorbit.backend.Service.Skills;

import com.workorbit.backend.DTO.SkillDTO;

import java.util.List;

public interface SkillsService {
    SkillDTO addSkill(SkillDTO dto);
    void removeSkillFromFreelancer(Long freelancerId, String skillName);
}

