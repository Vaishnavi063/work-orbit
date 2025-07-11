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
    public PastWork addPastWork(PastWorkDTO dto) {
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        PastWork work = new PastWork();
        work.setFreelancer(freelancer);
        work.setTitle(dto.getTitle());
        work.setLink(dto.getLink());
        work.setDescription(dto.getDescription());

        return pastWorkRepo.save(work);
    }

    @Override
    public List<PastWork> getPastWorkByFreelancerId(Long freelancerId) {
        return pastWorkRepo.findByFreelancerId(freelancerId);
    }

    @Override
    public PastWork updatePastWork(Long id, PastWorkDTO dto) {
        PastWork work = pastWorkRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Past work not found"));

        work.setTitle(dto.getTitle());
        work.setLink(dto.getLink());
        work.setDescription(dto.getDescription());
        return pastWorkRepo.save(work);
    }

    @Override
    public void deletePastWork(Long id) {
        pastWorkRepo.deleteById(id);
    }

}
