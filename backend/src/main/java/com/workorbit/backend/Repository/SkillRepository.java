package com.workorbit.backend.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.workorbit.backend.Entity.Skills;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skills, Long> {
    List<Skills> findByFreelancerId(Long freelancerId);
    Skills findByNameIgnoreCase(String skillName);
}
