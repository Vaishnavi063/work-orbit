package com.workorbit.backend.Controller;


import com.workorbit.backend.DTO.SkillDTO;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Service.Skills.SkillsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RequiredArgsConstructor
@RestController
@RequestMapping("freelancer/skills")
public class SkillController {

    private final SkillsService skillService;

    @PostMapping
    public ResponseEntity<SkillDTO> addSkill(@RequestBody SkillDTO dto) {
        SkillDTO saved = skillService.addSkill(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{freelancerId}/{skillName}")
    public ResponseEntity<String> removeSkill(
            @PathVariable Long freelancerId,
            @PathVariable String skillName) {
        skillService.removeSkillFromFreelancer(freelancerId, skillName);
        return ResponseEntity.ok("Skill removed");
    }
}
