package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ClientRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;

    @Override
    public ProjectDTO createProject(ProjectDTO dto) {
        Optional<Client> optionalClient = clientRepository.findById(dto.getClientId());
        if (optionalClient.isEmpty()) {
            throw new RuntimeException("Client not found");
        }
        Client client = optionalClient.get();


        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setDeadline(dto.getDeadline());
        project.setBudget(dto.getBudget());
        project.setClient(client);


        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    @Override
    public List<ProjectDTO> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        List<ProjectDTO> dtoList = new ArrayList<>();

        for (Project project : projects) {
            dtoList.add(toDTO(project));
        }

        return dtoList;
    }


    @Override
    public ProjectDTO getProjectById(Long id) {
        Optional<Project> optionalProject = projectRepository.findById(id);

        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            return toDTO(project);
        } else {
            throw new RuntimeException("Project not found");
        }
    }

    @Override
    public boolean deleteProjectById(Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    private ProjectDTO toDTO(Project project) {
        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getDeadline(),
                project.getBudget(),
                project.getStatus(),
                project.getClient() != null ? project.getClient().getId() : null
        );
    }
}
