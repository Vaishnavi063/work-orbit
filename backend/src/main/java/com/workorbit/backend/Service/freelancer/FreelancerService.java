package com.workorbit.backend.Service.freelancer;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.Entity.Freelancer;
import java.util.List;

public interface FreelancerService {
    FreelancerDTO getFreelancerProfile(Long freelancerId);
    void deleteFreelancer(Long id);
}