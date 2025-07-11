package com.workorbit.backend.Service.Skills;

import com.workorbit.backend.DTO.SkillDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SkillsServiceImpl implements SkillsService{

    @Autowired
    private SkillRepository skillRepo;

    @Autowired
    private FreelancerRepository freelancerRepo;

    @Override
    public Skills addSkill(SkillDTO dto) {
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        //Check if skill already exists in DB
        Skills existingSkill = skillRepo.findByNameIgnoreCase(dto.getSkillName());

        Skills skillToUse;

        if (existingSkill != null) {
            skillToUse = existingSkill;
        } else {
            //Create new skill if not found
            skillToUse = new Skills();
            skillToUse.setName(dto.getSkillName());
            skillRepo.save(skillToUse); // save once to get ID
        }

        //Link freelancer to skill
        skillToUse.getFreelancers().add(freelancer);

        //Save relation
        return skillRepo.save(skillToUse);
    }


    @Override
    public List<Skills> getSkillsByFreelancerId(Long freelancerId) {
        return skillRepo.findByFreelancerId(freelancerId);
    }

    @Override
    public void removeSkillFromFreelancer(Long freelancerId, String skillName) {
        Skills skill = skillRepo.findByNameIgnoreCase(skillName);
        if (skill == null) throw new RuntimeException("Skill not found");

        Freelancer freelancer = freelancerRepo.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        skill.getFreelancers().remove(freelancer);
        skillRepo.save(skill); // update join table
    }

}

