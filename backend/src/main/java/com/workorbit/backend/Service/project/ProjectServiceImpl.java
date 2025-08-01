package com.workorbit.backend.Service.project;

import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectCountResponse;
import com.workorbit.backend.DTO.ProjectCountsResponse;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.ClientRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import com.workorbit.backend.Service.contract.ContractService;
import com.workorbit.backend.Wallet.Service.WalletService;
import com.workorbit.backend.Chat.Service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ContractService contractService;
    private final WalletService walletService;
    private final BidRepository bidRepo;
    private final ChatService chatService;

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
    public List<ProjectDTO> getAllProjects(String query, String sortBy, String sortDirection) {
        log.info("Fetching all projects with query: '{}', sortBy: '{}', sortDirection: '{}'",
                query, sortBy, sortDirection);

        String validatedSortBy = validateSortField(sortBy);
        Sort.Direction direction = validateSortDirection(sortDirection);


        Sort sort = Sort.by(direction, validatedSortBy);

        List<Project> projects;

        if (query == null || query.trim().isEmpty()) {
            projects = projectRepository.findAll(sort);
        } else {

            projects = projectRepository.findProjectsWithSearch(query.trim(), sort);
        }

        log.info("Found {} projects", projects.size());
        return projects.stream().map(this::toDTO).toList();
    }

    private String validateSortField(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "createdAt";
        }

        // Map of allowed sort fields
        Map<String, String> allowedSortFields = Map.of(
                "budget", "budget",
                "deadline", "deadline",
                "title", "title",
                "category", "category",
                "created", "createdAt",
                "updated", "updatedAt"
        );

        String normalizedSortBy = sortBy.toLowerCase().trim();
        return allowedSortFields.getOrDefault(normalizedSortBy, "createdAt");
    }

    private Sort.Direction validateSortDirection(String sortDirection) {
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            return Sort.Direction.DESC;
        }

        String normalizedDirection = sortDirection.toLowerCase().trim();
        return switch (normalizedDirection) {
            case "asc", "ascending" -> Sort.Direction.ASC;
            case "desc", "descending" -> Sort.Direction.DESC;
            default -> Sort.Direction.DESC;
        };
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

                // Close chat rooms for rejected bids
                try {
                    chatService.closeBidChat(bid.getId());
                    log.info("Chat room closed for rejected bid: {}", bid.getId());
                } catch (Exception e) {
                    log.error("Failed to close chat room for rejected bid: {}", bid.getId(), e);
                    // Continue with bid rejection even if chat closure fails
                }
            }
        }
        bidRepo.saveAll(allBids);

        Long clientId = project.getClient().getId();
        Double amount = acceptedBid.getBidAmount();

        log.info("Freezing amount {} for clientId {} on projectId {}", amount, clientId, projectId);
        walletService.freezeAmount(clientId, projectId, amount);

        Long contractId = contractService.createContract(acceptedBid);

        // Convert bid negotiation chat to contract chat
        try {
            chatService.convertToContractChat(bidId, contractId);
            log.info("Bid chat converted to contract chat for bid: {} and contract: {}", bidId, contractId);
        } catch (Exception e) {
            log.error("Failed to convert bid chat to contract chat for bid: {} and contract: {}", bidId, contractId, e);
            // Don't fail the bid acceptance if chat conversion fails
        }
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

        // Send system notification to bid negotiation chat
        try {
            chatService.sendBidSystemNotification(bidId, "Bid has been rejected.");
            log.info("System notification sent for rejected bid: {}", bidId);
        } catch (Exception e) {
            log.error("Failed to send system notification for rejected bid: {}", bidId, e);
        }

        // Close the bid chat room
        try {
            chatService.closeBidChat(bidId);
            log.info("Chat room closed for rejected bid: {}", bidId);
        } catch (Exception e) {
            log.error("Failed to close chat room for rejected bid: {}", bidId, e);
            // Continue with bid rejection even if chat closure fails
        }

        log.info("Bid rejected: {}", bid.getId());
    }

    @Override
    public ProjectCountsResponse getProjectCountsByCategory() {
        log.info("Fetching project counts by category");
        
        List<Object[]> categoryCountsRaw = projectRepository.countActiveProjectsByCategory();
        Long totalActiveProjects = projectRepository.countTotalActiveProjects();
        
        LocalDateTime now = LocalDateTime.now();
        List<ProjectCountResponse> counts = categoryCountsRaw.stream()
                .map(row -> {
                    String category = (String) row[0];
                    Long count = (Long) row[1];
                    Long categoryId = getCategoryIdFromName(category);
                    return new ProjectCountResponse(category, categoryId, count, now);
                })
                .toList();
        
        log.info("Found {} categories with active projects, total: {}", counts.size(), totalActiveProjects);
        return new ProjectCountsResponse(counts, totalActiveProjects);
    }

    private Long getCategoryIdFromName(String categoryName) {
        return switch (categoryName.toLowerCase()) {
            case "web development" -> 1L;
            case "graphic design" -> 2L;
            case "photography" -> 3L;
            case "marketing" -> 4L;
            case "video editing" -> 5L;
            case "content writing" -> 6L;
            case "it & networking" -> 7L;
            case "translation" -> 8L;
            case "swe" -> 9L;
            case "ai-ml" -> 10L;
            case "mobile development" -> 11L;
            case "ui-ux designer" -> 12L;
            case "app development" -> 11L; // Map app development to mobile development
            case "data analysis" -> 10L; // Map data analysis to AI-ML
            default -> 0L; // Default ID for unknown categories
        };
    }

    private ProjectDTO toDTO(Project project) {
        ClientDTO clientDTO = null;

        if (project.getClient() != null && project.getClient().getAppUser() != null) {
            clientDTO = new ClientDTO(
                    project.getClient().getName(),
                    project.getClient().getAppUser().getEmail(),
                    null);
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
                project.getBids() != null ? project.getBids().size() : 0);
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
        if (project == null)
            return null;

        ClientDTO clientDTO = null;

        if (project.getClient() != null && project.getClient().getAppUser() != null) {
            clientDTO = new ClientDTO(
                    project.getClient().getName(),
                    project.getClient().getAppUser().getEmail(),
                    null);
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
                project.getBids() != null ? project.getBids().size() : 0);
    }
}