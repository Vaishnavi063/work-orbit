package com.workorbit.backend.Repository;

import com.workorbit.backend.Entity.Project;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Search with sorting
    @Query("SELECT p FROM Project p WHERE " +
            "(:query IS NULL OR :query = '' OR " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Project> findProjectsWithSearch(@Param("query") String query, Sort sort);

    // Keep the original method for backward compatibility
    List<Project> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(String titlePart, String categoryPart);
}