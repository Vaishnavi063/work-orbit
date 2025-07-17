package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.ClientRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final BidRepository bidRepo;

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

    @Override
    public List<BidResponseDTO> getBidsByProjectId(Long projectId) {
        return bidRepo.findByProject_Id(projectId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            throw new RuntimeException("Project not found");
        }

        Project project = optionalProject.get();

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setDeadline(dto.getDeadline());
        project.setBudget(dto.getBudget());

        if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            project.setClient(client);
        }

        Project updated = projectRepository.save(project);

        return toDTO(updated);
    }

    @Override
    public void acceptBid(Long projectId, Long bidId) {
        Bids acceptedBid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        Project project = acceptedBid.getProject();

        if (!project.getId().equals(projectId)) {
            throw new RuntimeException("Bid does not belong to the specified project");
        }

        project.setStatus(Project.ProjectStatus.CLOSED);
        projectRepository.save(project);

        List<Bids> allBids = bidRepo.findByProject_Id(projectId);

        for (Bids bid : allBids) {
            if (bid.getId().equals(bidId)) {
                bid.setStatus(Bids.bidStatus.Accepted);
            } else {
                bid.setStatus(Bids.bidStatus.Rejected);
            }
        }

        bidRepo.saveAll(allBids);
    }

    @Override
    public void rejectBid(Long projectId, Long bidId) {
        Bids bid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Bid does not belong to the specified project");
        }

        // Only allow rejection if bid is in PENDING state
        if (bid.getStatus() != Bids.bidStatus.Pending) {
            throw new IllegalStateException("Only pending bids can be rejected");
        }

        bid.setStatus(Bids.bidStatus.Rejected);
        bidRepo.save(bid);
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

    private BidResponseDTO mapToDTO(Bids bid) {
        BidResponseDTO dto = new BidResponseDTO();
        dto.setBidId(bid.getId());
        dto.setFreelancerId(bid.getFreelancer().getId());
        dto.setProjectId(bid.getProject().getId());
        dto.setProposal(bid.getProposal());
        dto.setBidAmount(bid.getBidAmount());
        dto.setDurationDays(bid.getDurationDays());
        dto.setStatus(bid.getStatus().toString());
        dto.setCreatedAt(bid.getCreatedAt());
        return dto;
    }
}
