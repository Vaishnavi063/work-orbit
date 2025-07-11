package com.workorbit.backend.Service.pastWork;

import com.workorbit.backend.DTO.PastWorkDTO;
import com.workorbit.backend.Entity.PastWork;

import java.util.List;

public interface PastWorkService {
    PastWork addPastWork(PastWorkDTO dto);
    List<PastWork> getPastWorkByFreelancerId(Long freelancerId);
    PastWork updatePastWork(Long id, PastWorkDTO dto);
    void deletePastWork(Long id);

}
