package com.workorbit.backend.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.workorbit.backend.Entity.PastWork;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastWorkRepository extends JpaRepository<PastWork, Long>  {
    List<PastWork> findByFreelancerId(Long freelancerId);
}
