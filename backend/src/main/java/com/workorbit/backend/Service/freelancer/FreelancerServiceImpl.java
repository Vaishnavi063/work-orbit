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
                dto.setId(p.getId());
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

    @Override
    public FreelancerDTO updateFreelancerProfile(Long id, com.workorbit.backend.DTO.FreelancerUpdateDTO dto) {
        log.info("Updating profile for freelancer ID: {}", id);
        Freelancer freelancer = freelancerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));
        log.info("Found freelancer: {}", freelancer.getName());

        // Update basic info
        if (dto.getName() != null) {
            log.info("Updating name to: {}", dto.getName());
            freelancer.setName(dto.getName());
        }
        if (dto.getRating() != null) {
            log.info("Updating rating to: {}", dto.getRating());
            freelancer.setRating(dto.getRating());
        }
        // Do NOT update email here, as email is required for login and should not be changed.

        // Update skills (many-to-many)
        if (dto.getSkills() != null) {
            log.info("Updating skills. New skills: {}", dto.getSkills());
            java.util.Set<Skills> newSkills = new java.util.HashSet<>();
            for (String skillName : dto.getSkills()) {
                Skills skill = skillRepo.findByNameIgnoreCase(skillName);
                if (skill == null) {
                    log.info("Creating new skill: {}", skillName);
                    skill = new Skills();
                    skill.setName(skillName);
                    skill = skillRepo.save(skill);
                }
                newSkills.add(skill);
            }
            freelancer.setFreelancerSkill(newSkills);
            log.info("Skills updated.");
        }

        // Update past works (one-to-many, modify collection in place)
        if (dto.getPastWorks() != null) {
            log.info("Updating past works.");
            List<PastWork> currentPastWorks = freelancer.getPastWorks();
            if (currentPastWorks == null) {
                currentPastWorks = new java.util.ArrayList<>();
                freelancer.setPastWorks(currentPastWorks);
            }
            // Build set of IDs to keep
            java.util.Set<Long> updatedIds = dto.getPastWorks().stream()
                .filter(pw -> pw.getId() != null && !Boolean.TRUE.equals(pw.getToDelete()))
                .map(com.workorbit.backend.DTO.PastWorkUpdateDTO::getId)
                .collect(java.util.stream.Collectors.toSet());
            // Remove deleted past works
            currentPastWorks.removeIf(pw -> {
                boolean toRemove = pw.getId() != null && !updatedIds.contains(pw.getId());
                if (toRemove) {
                    log.info("Removing past work with ID: {}", pw.getId());
                }
                return toRemove;
            });
            // Add new and update existing
            for (var pwDto : dto.getPastWorks()) {
                if (pwDto.getId() == null && !Boolean.TRUE.equals(pwDto.getToDelete())) {
                    // New past work
                    log.info("Adding new past work with title: {}", pwDto.getTitle());
                    PastWork pw = new PastWork();
                    pw.setTitle(pwDto.getTitle());
                    pw.setLink(pwDto.getLink());
                    pw.setDescription(pwDto.getDescription());
                    pw.setFreelancer(freelancer);
                    currentPastWorks.add(pw);
                } else if (pwDto.getId() != null && Boolean.TRUE.equals(pwDto.getToDelete())) {
                    // Already handled by removeIf above
                    continue;
                } else if (pwDto.getId() != null) {
                    // Update existing
                    log.info("Updating past work with ID: {}", pwDto.getId());
                    PastWork pw = currentPastWorks.stream()
                        .filter(existing -> existing.getId().equals(pwDto.getId()))
                        .findFirst()
                        .orElseThrow();
                    pw.setTitle(pwDto.getTitle());
                    pw.setLink(pwDto.getLink());
                    pw.setDescription(pwDto.getDescription());
                }
            }
            log.info("Past works updated.");
        }

        Freelancer saved = freelancerRepo.save(freelancer);
        log.info("Successfully saved updated profile for freelancer ID: {}", saved.getId());
        // Reuse getFreelancerProfile to build the response
        return getFreelancerProfile(saved.getId());
    }
}
