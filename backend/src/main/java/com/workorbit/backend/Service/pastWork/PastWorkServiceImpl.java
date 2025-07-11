package com.workorbit.backend.Service.pastWork;

import com.workorbit.backend.DTO.PastWorkDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.PastWork;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.PastWorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PastWorkServiceImpl implements PastWorkService {

    @Autowired
    private PastWorkRepository pastWorkRepo;

    @Autowired
    private FreelancerRepository freelancerRepo;

    @Override
    public PastWorkDTO addPastWork(PastWorkDTO dto) {
        // Find the freelancer by ID for whom the past work is being added
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        // Create and populate the PastWork entity
        PastWork work = new PastWork();
        work.setFreelancer(freelancer);
        work.setTitle(dto.getTitle());
        work.setLink(dto.getLink());
        work.setDescription(dto.getDescription());

        PastWork saved = pastWorkRepo.save(work);

        // Map the saved entity to a DTO for the response
        PastWorkDTO result = new PastWorkDTO();
        result.setTitle(saved.getTitle());
        result.setLink(saved.getLink());
        result.setDescription(saved.getDescription());
        result.setFreelancerId(saved.getFreelancer().getId());
        return result;
    }

    @Override
    public List<PastWork> getPastWorkByFreelancerId(Long freelancerId) {
        // Fetch all past works for a freelancer
        return pastWorkRepo.findByFreelancerId(freelancerId);
    }

    @Override
    public PastWork updatePastWork(Long id, PastWorkDTO dto) {
        // Find the past work entry by ID and update its fields
        PastWork work = pastWorkRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Past work not found"));

        work.setTitle(dto.getTitle());
        work.setLink(dto.getLink());
        work.setDescription(dto.getDescription());
        return pastWorkRepo.save(work);
    }

    @Override
    public void deletePastWork(Long id) {
        // Delete the past work entry by its ID
        pastWorkRepo.deleteById(id);
    }

}
