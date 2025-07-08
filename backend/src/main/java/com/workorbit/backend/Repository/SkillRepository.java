package com.workorbit.backend.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.workorbit.backend.Entity.Skills;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skills, Long> {

}
