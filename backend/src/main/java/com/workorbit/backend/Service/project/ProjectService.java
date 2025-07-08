package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.DTO.ProjectDTO;

import java.util.List;

public interface ProjectService {
     ProjectDTO createProject(ProjectDTO dto);
     List<ProjectDTO> getAllProjects();
     ProjectDTO getProjectById(Long id);
     boolean deleteProjectById(Long id);
}
