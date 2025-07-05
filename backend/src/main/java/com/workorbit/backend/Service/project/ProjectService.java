package com.workorbit.backend.Service.project;


import com.workorbit.backend.Entity.Project;

import java.util.List;

public interface ProjectService {
     Project createProject(Project project);
     List<Project> getAllProjects();
     Project getProjectById(Long id);
     boolean deleteProjectById(Long id);
}
