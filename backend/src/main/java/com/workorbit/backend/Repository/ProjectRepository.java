package com.workorbit.backend.Repository;

import com.workorbit.backend.Entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 🔍 Search projects by title or category (case-insensitive)
    @Query("SELECT p FROM Project p WHERE " +
            "(:query IS NULL OR :query = '' OR " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Project> findProjectsWithSearch(@Param("query") String query);

    // 📊 Count open projects grouped by category
    @Query("SELECT p.category, COUNT(p) FROM Project p WHERE p.status = 'OPEN' GROUP BY p.category")
    List<Object[]> countActiveProjectsByCategory();

    // 📈 Total count of open projects
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'OPEN'")
    Long countTotalActiveProjects();
}