package com.workorbit.backend.Service.project;


import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;


    @Override
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
}
