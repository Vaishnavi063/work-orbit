package com.workorbit.backend.Service.freelancer;

import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.DTO.PastWorkDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.PastWork;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.PastWorkRepository;
import com.workorbit.backend.Repository.SkillRepository;
import com.workorbit.backend.Service.Skills.SkillsService;
import com.workorbit.backend.Service.freelancer.FreelancerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FreelancerServiceImpl implements FreelancerService {

    @Autowired
    private FreelancerRepository freelancerRepo;

    @Autowired
    private AppUserRepository appUserRepo;

    @Autowired
    private SkillRepository skillRepo;

    @Autowired
    private PastWorkRepository pastWorkRepo;

    @Override
    public FreelancerDTO getFreelancerProfile(Long freelancerId) {
        Freelancer freelancer = freelancerRepo.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        AppUser appUser = freelancer.getAppUser();

        List<Skills> skills = skillRepo.findByFreelancerId(freelancerId);
        List<PastWork> pastWorks = pastWorkRepo.findByFreelancerId(freelancerId);

        FreelancerDTO profile = new FreelancerDTO();
        profile.setName(freelancer.getName());
        profile.setEmail(appUser.getEmail());
        profile.setRating(freelancer.getRating());


        skills.stream()
                .map(Skills::getName)
                .collect(Collectors.toList());

        profile.setPastWorks(
                pastWorks.stream().map(p -> {
                    PastWorkDTO dto = new PastWorkDTO();
                    dto.setTitle(p.getTitle());
                    dto.setLink(p.getLink());
                    dto.setDescription(p.getDescription());
                    return dto;
                }).toList()
        );

        return profile;
    }

    @Override
    public void deleteFreelancer(Long id) {
        freelancerRepo.deleteById(id);
    }
}
