package com.workorbit.backend.Service.freelancer;

import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.DTO.PastWorkDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.PastWork;
import com.workorbit.backend.Entity.Skills;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.PastWorkRepository;
import com.workorbit.backend.Repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreelancerServiceImpl implements FreelancerService {

    private final FreelancerRepository freelancerRepo;
    private final SkillRepository skillRepo;
    private final PastWorkRepository pastWorkRepo;

    @Override
    public FreelancerDTO getFreelancerProfile(Long freelancerId) {
        // Fetch the freelancer entity by ID
        log.info("Fetching freelancer profile for ID: {}", freelancerId);
        Freelancer freelancer = freelancerRepo.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));
        log.info("Freelancer found: {}", freelancer.getName());

        AppUser appUser = freelancer.getAppUser();
        log.info("AppUser found: {}", appUser.getEmail());

        // Fetch skills and past works for the freelancer
        List<Skills> skills = skillRepo.findByFreelancers_Id(freelancerId);
        log.info("Found {} skills", skills.size());

        List<PastWork> pastWorks = pastWorkRepo.findByFreelancerId(freelancerId);
        log.info("Found {} past works", pastWorks.size());

        // Build the FreelancerDTO response
        FreelancerDTO profile = new FreelancerDTO();
        log.info("Freelancer name: {}", freelancer.getName());
        profile.setName(freelancer.getName());
        log.info("Freelancer email: {}", appUser.getEmail());
        profile.setEmail(appUser.getEmail());
        log.info("Freelancer rating: {}", freelancer.getRating());
        profile.setRating(freelancer.getRating());

        // Map skills to a list of skill names
        profile.setSkills(
                skills.stream()
                        .map(Skills::getName)
                        .collect(Collectors.toList())
        );
        log.info("Skills mapped: {}", profile.getSkills());

        // Map past works to DTOs (excluding freelancerId for profile response)
        profile.setPastWorks(
            pastWorks.stream().map(p -> {
                PastWorkDTO dto = new PastWorkDTO();
                dto.setTitle(p.getTitle());
                dto.setLink(p.getLink());
                dto.setDescription(p.getDescription());
                return dto;
            }).toList()
        );
        log.info("Past works mapped: {}", profile.getPastWorks());
        log.info("Freelancer profile created: {}", profile.getName());
        return profile;
    }

    @Override
    public void deleteFreelancer(Long id) {
        log.info("Deleting freelancer by ID: {}", id);
        freelancerRepo.deleteById(id);
        log.info("Freelancer deleted: {}", id);
    }
}
