package com.workorbit.backend.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.workorbit.backend.Entity.Skills;

public interface SkillRepository extends JpaRepository<Skills, Long> {

}
