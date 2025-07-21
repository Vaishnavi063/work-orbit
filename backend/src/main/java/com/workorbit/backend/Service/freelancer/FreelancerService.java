package com.workorbit.backend.Service.freelancer;
import com.workorbit.backend.DTO.FreelancerDTO;

public interface FreelancerService {
    FreelancerDTO getFreelancerProfile(Long freelancerId);
    void deleteFreelancer(Long id);
    FreelancerDTO updateFreelancerProfile(Long id, com.workorbit.backend.DTO.FreelancerUpdateDTO dto);
}