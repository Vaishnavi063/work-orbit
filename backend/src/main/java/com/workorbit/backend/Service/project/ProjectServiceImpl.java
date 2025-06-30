package com.workorbit.backend.Service.project;


import com.workorbit.backend.Entity.ProjectEntity;
import com.workorbit.backend.Repository.ProjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepo  projectRepo;


    @Override
    public ProjectEntity createProject(ProjectEntity projectEntity) {
        return projectRepo.save(projectEntity);
    }
}
