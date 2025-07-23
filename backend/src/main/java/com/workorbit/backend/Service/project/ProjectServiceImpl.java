package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.ClientRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import com.workorbit.backend.Service.contract.ContractService;
import com.workorbit.backend.Wallet.Service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.List;
import java.util.Optional;

import static com.workorbit.backend.Service.bid.BidServiceImpl.getBidResponseDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ContractService contractService;
    private final WalletService walletService;
    private final BidRepository bidRepo;

    @Override
    public ProjectDTO createProject(ProjectDTO dto) {
        log.info("Creating project: {}", dto.getTitle());
        Optional<Client> optionalClient = clientRepository.findById(dto.getClientId());
        if (optionalClient.isEmpty()) {
            throw new RuntimeException("Client not found");
        }
        Client client = optionalClient.get();

        log.info("Client found: {}", client.getName());
        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setDeadline(dto.getDeadline());
        project.setBudget(dto.getBudget());
        project.setClient(client);
        project.setCategory(dto.getCategory());

        Project saved = projectRepository.save(project);
        log.info("Project saved: {}", saved.getTitle());
        return toDTO(saved);
    }

    @Override
    public List<ProjectDTO> getAllProjects(String query) {
        log.info("Fetching all projects");
        List<Project> projects;

        if (query == null || query.trim().isEmpty()) {
            projects = projectRepository.findAll();
        } else {
            String trimmedQuery = query.trim();
            projects = projectRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(trimmedQuery, trimmedQuery);
        }

        return projects.stream().map(this::toDTO).toList();
    }
    @Override
    public ProjectDTO getProjectById(Long id) {
        log.info("Fetching project by ID: {}", id);
        Optional<Project> optionalProject = projectRepository.findById(id);

        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            log.info("Project found: {}", project.getTitle());
            return toDTO(project);
        } else {
            log.error("Project not found with ID: {}", id);
            throw new RuntimeException("Project not found");
        }
    }

    @Override
    public boolean deleteProjectById(Long id) {
        log.info("Deleting project by ID: {}", id);
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            log.info("Project deleted: {}", id);
            return true;
        } else {
            log.error("Project not found with ID: {}", id);
            return false;
        }
    }

    @Override
    public List<BidResponseDTO> getBidsByProjectId(Long projectId) {
        log.info("Fetching bids by project ID: {}", projectId);
        return bidRepo.findByProject_Id(projectId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        log.info("Updating project by ID: {}", id);
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            log.error("Project not found with ID: {}", id);
            throw new RuntimeException("Project not found");
        }

        Project project = optionalProject.get();

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setDeadline(dto.getDeadline());
        project.setBudget(dto.getBudget());
        project.setCategory(dto.getCategory());

        if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            log.info("Client found: {}", client.getName());
            project.setClient(client);
        }

        Project updated = projectRepository.save(project);
        log.info("Project updated: {}", updated.getTitle());
        return toDTO(updated);
    }

    @Override
    public void acceptBid(Long projectId, Long bidId) {
        log.info("Accepting bid for project ID: {} with bid ID: {}", projectId, bidId);
        Bids acceptedBid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        Project project = acceptedBid.getProject();

        if (!project.getId().equals(projectId)) {
            throw new RuntimeException("Bid does not belong to the specified project");
        }

        if (acceptedBid.getStatus() != Bids.bidStatus.Pending) {
            throw new IllegalStateException("Only pending bids can be accepted");
        }

        log.info("Setting project status to CLOSED");
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

        Long clientId = project.getClient().getId();
        Double amount = acceptedBid.getBidAmount();

        log.info("Freezing amount {} for clientId {} on projectId {}", amount, clientId, projectId);
        walletService.freezeAmount(clientId, projectId, amount);

        contractService.createContract(acceptedBid);
    }


    @Override
    public void rejectBid(Long projectId, Long bidId) {
        log.info("Rejecting bid for project ID: {} with bid ID: {}", projectId, bidId);
        Bids bid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getProject().getId().equals(projectId)) {
            log.error("Bid does not belong to the specified project: {}", bidId);
            throw new RuntimeException("Bid does not belong to the specified project");
        }

        // Only allow rejection if bid is in PENDING state
        if (bid.getStatus() != Bids.bidStatus.Pending) {
            log.error("Bid is not in PENDING state: {}", bid.getId());
            throw new IllegalStateException("Only pending bids can be rejected");
        }

        bid.setStatus(Bids.bidStatus.Rejected);
        bidRepo.save(bid);
        log.info("Bid rejected: {}", bid.getId());
    }

    private ProjectDTO toDTO(Project project) {
        ClientDTO clientDTO = null;

        if (project.getClient() != null && project.getClient().getAppUser() != null) {
            clientDTO = new ClientDTO(
                    project.getClient().getName(),
                    project.getClient().getAppUser().getEmail(),
                    null
            );
        }

        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getCategory(),
                project.getDeadline(),
                project.getBudget(),
                project.getStatus(),
                clientDTO,
                project.getClient() != null ? project.getClient().getId() : null,
                project.getCreatedAt(),
                project.getUpdatedAt(),
                project.getBids() != null ? project.getBids().size() : 0
        );
    }

    private BidResponseDTO mapToDTO(Bids bid) {
        BidResponseDTO dto = new BidResponseDTO();
        dto.setBidId(bid.getId());
        dto.setFreelancerId(bid.getFreelancer().getId());

        if (bid.getFreelancer() != null && bid.getFreelancer().getAppUser() != null) {
            dto.setFreelancerName(bid.getFreelancer().getName());
        }

        dto.setProject(toProjectDTO(bid.getProject()));
        dto.setProposal(bid.getProposal());
        dto.setBidAmount(bid.getBidAmount());
        dto.setDurationDays(bid.getDurationDays());
        dto.setTeamSize(bid.getTeamSize());
        dto.setStatus(bid.getStatus().toString());
        dto.setCreatedAt(bid.getCreatedAt());
        return dto;
    }

    private ProjectDTO toProjectDTO(Project project) {
        if (project == null) return null;

        ClientDTO clientDTO = null;

        if (project.getClient() != null && project.getClient().getAppUser() != null) {
            clientDTO = new ClientDTO(
                    project.getClient().getName(),
                    project.getClient().getAppUser().getEmail(),
                    null // skip project list to avoid circular reference
            );
        }

        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getCategory(),
                project.getDeadline(),
                project.getBudget(),
                project.getStatus(),
                clientDTO,
                project.getClient() != null ? project.getClient().getId() : null,
                project.getCreatedAt(),        // ✅ ADD THIS LINE
                project.getUpdatedAt(),        // ✅ ADD THIS LINE
                project.getBids() != null ? project.getBids().size() : 0  // ✅ ADD THIS LINE
        );
    }
}