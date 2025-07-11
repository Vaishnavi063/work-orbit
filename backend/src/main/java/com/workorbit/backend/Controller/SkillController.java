package com.workorbit.backend.Controller;


import com.workorbit.backend.DTO.SkillDTO;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Service.Skills.SkillsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/skills")
public class SkillController {

    @Autowired
    private SkillsService skillService;

    @PostMapping
    public ResponseEntity<Skills> addSkill(@RequestBody SkillDTO dto) {
        return new ResponseEntity<>(skillService.addSkill(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{freelancerId}/{skillName}")
    public ResponseEntity<String> removeSkill(
            @PathVariable Long freelancerId,
            @PathVariable String skillName) {
        skillService.removeSkillFromFreelancer(freelancerId, skillName);
        return ResponseEntity.ok("Skill removed from freelancer.");
    }

}