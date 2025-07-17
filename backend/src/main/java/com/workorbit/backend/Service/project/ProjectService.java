package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ProjectDTO;

import java.util.List;

public interface ProjectService {
     ProjectDTO createProject(ProjectDTO dto);
     List<ProjectDTO> getAllProjects();
     ProjectDTO getProjectById(Long id);
     List<BidResponseDTO> getBidsByProjectId(Long projectId);
     ProjectDTO updateProject(Long id,ProjectDTO dto);
     boolean deleteProjectById(Long id);
}
