package com.workorbit.backend.Service.Skills;

import com.workorbit.backend.DTO.SkillDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class SkillsServiceImpl implements SkillsService {

    private final SkillRepository skillRepo;
    private final FreelancerRepository freelancerRepo;


    @Override
    public SkillDTO addSkill(SkillDTO dto) {
        // Find the freelancer by ID
        log.info("Adding skill for freelancer ID: {}", dto.getFreelancerId());
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));


        // Find or create the skill by name
        Skills skill = skillRepo.findByNameIgnoreCase(dto.getSkillName());
        if (skill == null) {
            skill = new Skills();
            skill.setName(dto.getSkillName());
            skill = skillRepo.save(skill);
            log.info("Skill created: {}", skill.getName());
        }

        // Add the skill to the freelancer (owning side of the relationship)
        freelancer.getFreelancerSkill().add(skill);
        // Also add the freelancer to the skill (inverse side, for in-memory consistency)
        skill.getFreelancers().add(freelancer);

        // Save the freelancer to persist the relationship in the join table
        freelancerRepo.save(freelancer);

        log.info("Skill added to freelancer: {}", freelancer.getName());

        return new SkillDTO(skill.getId(), skill.getName(), dto.getFreelancerId());
    }

    @Override
    public void removeSkillFromFreelancer(Long freelancerId, String skillName) {
        // Find the skill by name
        log.info("Removing skill from freelancer ID: {}", freelancerId);
        Skills skill = skillRepo.findByNameIgnoreCase(skillName);
        if (skill == null) throw new RuntimeException("Skill not found");

        // Find the freelancer by ID
        Freelancer freelancer = freelancerRepo.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        // Remove the skill from the freelancer (owning side)
        freelancer.getFreelancerSkill().remove(skill);
        // Also remove the freelancer from the skill (inverse side, for in-memory consistency)
        skill.getFreelancers().remove(freelancer);

        // Save the freelancer to persist the removal in the join table
        freelancerRepo.save(freelancer);

        log.info("Skill removed from freelancer: {}", freelancer.getName());
    }
}
