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
        // Removed rating update logic
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

        // Update past works (one-to-many)
        if (dto.getPastWorks() != null) {
            log.info("Updating past works by re-syncing the collection.");

            // First, handle deletions explicitly based on the DTO
            java.util.List<Long> idsToDelete = dto.getPastWorks().stream()
                    .filter(pwDto -> pwDto.getId() != null && Boolean.TRUE.equals(pwDto.getToDelete()))
                    .map(com.workorbit.backend.DTO.PastWorkUpdateDTO::getId)
                    .toList();

            if (!idsToDelete.isEmpty()) {
                log.info("Deleting past works with IDs: {}", idsToDelete);
                pastWorkRepo.deleteAllByIdInBatch(idsToDelete);
            }

            // Create a new list for the freelancer based on the DTO, excluding the deleted ones
            java.util.List<PastWork> newPastWorksList = new java.util.ArrayList<>();
            for (com.workorbit.backend.DTO.PastWorkUpdateDTO pwDto : dto.getPastWorks()) {
                if (pwDto.getId() != null && idsToDelete.contains(pwDto.getId())) {
                    continue; // Skip the ones we just deleted
                }

                PastWork pw;
                if (pwDto.getId() != null) {
                    // Update existing
                    log.info("Updating past work with ID: {}", pwDto.getId());
                    pw = pastWorkRepo.findById(pwDto.getId()).orElseThrow(() -> new RuntimeException("Past work to update not found"));
                } else {
                    // Add new
                    log.info("Adding new past work with title: {}", pwDto.getTitle());
                    pw = new PastWork();
                }

                pw.setTitle(pwDto.getTitle());
                pw.setLink(pwDto.getLink());
                pw.setDescription(pwDto.getDescription());
                pw.setFreelancer(freelancer);
                newPastWorksList.add(pw);
            }

            // Clear the original collection and add all from the new list
            freelancer.getPastWorks().clear();
            freelancer.getPastWorks().addAll(newPastWorksList);

            log.info("Past works re-synced.");
        }

        Freelancer saved = freelancerRepo.save(freelancer);
        log.info("Successfully saved updated profile for freelancer ID: {}", saved.getId());
        // Reuse getFreelancerProfile to build the response
        return getFreelancerProfile(saved.getId());
    }
}
