package com.workorbit.backend.Service.bid;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.FreelancerRepository;
import com.workorbit.backend.Repository.ProjectRepository;
import com.workorbit.backend.Repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepo;
    private final FreelancerRepository freelancerRepo;
    private final ProjectRepository projectRepo;

    @Override
    public Bids placeBid(BidDTO dto) {
        log.info("Placing bid for freelancer ID: {}", dto.getFreelancerId());
        // Fetch freelancer
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        log.info("Project found: {}", project.getTitle());


        if (project.getStatus() != Project.ProjectStatus.OPEN) {
            log.error("Project status is not OPEN");
            throw new IllegalStateException("Bids can only be placed on projects with status OPEN");
        }
        log.info("Project status is OPEN");


        boolean alreadyBid = bidRepo.existsByFreelancerIdAndProjectId(dto.getFreelancerId(), dto.getProjectId());
        if (alreadyBid) {
            log.error("Freelancer has already placed a bid on this project");
            throw new IllegalStateException("Freelancer has already placed a bid on this project");
        }
        log.info("Freelancer has not placed a bid on this project");


        Bids bid = new Bids();
        bid.setFreelancer(freelancer);
        bid.setProject(project);
        bid.setProposal(dto.getProposal());
        bid.setBidAmount(dto.getBidAmount());
        bid.setDurationDays(dto.getDurationDays());
        bid.setTeamSize(dto.getTeamSize());
        bid.setStatus(Bids.bidStatus.Pending);
        bid.setCreatedAt(LocalDateTime.now());
        log.info("Bid created: {}", bid.getId());

        return bidRepo.save(bid);
    }

    @Override
    public List<BidResponseDTO> getBidsByFreelancerId(Long freelancerId) {
        log.info("Fetching bids for freelancer ID: {}", freelancerId);

        // Fetch and map all bids for a freelancer to DTOs
        List<BidResponseDTO> bids = bidRepo.findByFreelancer_Id(freelancerId).stream().map(this::mapToDTO).toList();
        log.info("Bids found: {}", bids.size());
        return bids;
    }

    @Override
    public void deleteBid(Long bidId, Long freelancerId) {
        log.info("Deleting bid by ID: {}", bidId);
        // Find the bid and check if the freelancer is authorized to delete it
        Bids bid = bidRepo.findById(bidId).orElseThrow(() -> new RuntimeException("Bid not found"));
        log.info("Bid found: {}", bid.getId());

        if (!bid.getFreelancer().getId().equals(freelancerId)) {
            log.error("Freelancer is not authorized to delete the bid");
            throw new RuntimeException("You can only delete your own bids.");
        }
        log.info("Freelancer is authorized to delete the bid");

        if (!bid.getStatus().equals(Bids.bidStatus.Pending)) {
            log.error("Bid is not pending, cannot delete");
            throw new RuntimeException("Only pending bids can be deleted.");
        }
        log.info("Bid is pending, deleting bid");

        bidRepo.deleteById(bidId);
        log.info("Bid deleted: {}", bidId);
    }

    private BidResponseDTO mapToDTO(Bids bid) {
        return getBidResponseDTO(bid);
    }

    public static BidResponseDTO getBidResponseDTO(Bids bid) {
        BidResponseDTO dto = new BidResponseDTO();
        dto.setBidId(bid.getId());
        dto.setFreelancerId(bid.getFreelancer().getId());
        dto.setProjectId(bid.getProject().getId());
        dto.setFreelancerName(bid.getFreelancer().getName());
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
                    null // prevent circular reference
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
                project.getClient() != null ? project.getClient().getId() : null // optional for internal use
        );
    }
}