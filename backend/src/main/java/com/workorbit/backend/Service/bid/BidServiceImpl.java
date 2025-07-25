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
import com.workorbit.backend.Chat.Service.ChatService;
import com.workorbit.backend.Service.contract.ContractService;
import com.workorbit.backend.Wallet.Service.WalletService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepo;
    private final FreelancerRepository freelancerRepo;
    private final ProjectRepository projectRepo;
    private final ChatService chatService;
    private final ContractService contractService;
    private final WalletService walletService;

    @Override
    @Transactional
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

        Bids savedBid = bidRepo.save(bid);
        log.info("Bid created with ID: {}", savedBid.getId());

        // Create bid negotiation chat room
        try {
            chatService.createBidNegotiationChat(savedBid.getId());
            log.info("Bid negotiation chat created for bid ID: {}", savedBid.getId());
        } catch (Exception e) {
            log.error("Failed to create bid negotiation chat for bid ID: {}", savedBid.getId(), e);
            // Don't fail the bid creation if chat creation fails
        }

        return savedBid;
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
    @Transactional
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

        // Close the bid chat room if it exists
        try {
            chatService.closeBidChat(bidId);
            log.info("Chat room closed for bid: {}", bidId);
        } catch (Exception e) {
            log.error("Failed to close chat room for bid: {}", bidId, e);
            // Continue with bid deletion even if chat closure fails
        }

        bidRepo.deleteById(bidId);
        log.info("Bid deleted: {}", bidId);
    }

    private BidResponseDTO mapToDTO(Bids bid) {
        return getBidResponseDTO(bid);
    }

    @Override
    @Transactional
    public Long acceptBid(Long bidId, Long clientId) {
        log.info("Accepting bid ID: {} by client ID: {}", bidId, clientId);

        Bids bid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        Project project = bid.getProject();

        // Validate that the client owns the project
        if (!project.getClient().getId().equals(clientId)) {
            log.error("Client {} is not authorized to accept bid for project {}", clientId, project.getId());
            throw new RuntimeException("You are not authorized to accept this bid");
        }

        // Validate bid status
        if (bid.getStatus() != Bids.bidStatus.Pending) {
            log.error("Bid {} is not in PENDING state", bidId);
            throw new IllegalStateException("Only pending bids can be accepted");
        }

        // Update project status to CLOSED
        project.setStatus(Project.ProjectStatus.CLOSED);
        projectRepo.save(project);

        // Update all bids for this project
        List<Bids> allBids = bidRepo.findByProject_Id(project.getId());
        for (Bids b : allBids) {
            if (b.getId().equals(bidId)) {
                b.setStatus(Bids.bidStatus.Accepted);
            } else {
                b.setStatus(Bids.bidStatus.Rejected);

                // Close chat rooms for rejected bids
                try {
                    chatService.closeBidChat(b.getId());
                    log.info("Chat room closed for rejected bid: {}", b.getId());
                } catch (Exception e) {
                    log.error("Failed to close chat room for rejected bid: {}", b.getId(), e);
                    // Continue with bid rejection even if chat closure fails
                }
            }
        }
        bidRepo.saveAll(allBids);

        // Freeze the bid amount from client's wallet
        try {
            walletService.freezeAmount(clientId, project.getId(), bid.getBidAmount());
            log.info("Amount {} frozen from client {} wallet for project {}", bid.getBidAmount(), clientId,
                    project.getId());
        } catch (Exception e) {
            log.error("Failed to freeze amount for bid acceptance: {}", e.getMessage());
            throw new RuntimeException("Failed to freeze payment amount: " + e.getMessage());
        }

        // Create contract for accepted bid
        Long contractId = contractService.createContract(bid);

        // Convert bid negotiation chat to contract chat
        try {
            chatService.convertToContractChat(bidId, contractId);
            log.info("Bid chat converted to contract chat for bid: {} and contract: {}", bidId, contractId);
        } catch (Exception e) {
            log.error("Failed to convert bid chat to contract chat for bid: {} and contract: {}", bidId, contractId, e);
            // Don't fail the bid acceptance if chat conversion fails
        }

        log.info("Bid {} accepted successfully, contract {} created", bidId, contractId);
        return contractId;
    }

    @Override
    @Transactional
    public void rejectBid(Long bidId, Long clientId) {
        log.info("Rejecting bid ID: {} by client ID: {}", bidId, clientId);

        Bids bid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        Project project = bid.getProject();

        // Validate that the client owns the project
        if (!project.getClient().getId().equals(clientId)) {
            log.error("Client {} is not authorized to reject bid for project {}", clientId, project.getId());
            throw new RuntimeException("You are not authorized to reject this bid");
        }

        // Validate bid status
        if (bid.getStatus() != Bids.bidStatus.Pending) {
            log.error("Bid {} is not in PENDING state", bidId);
            throw new IllegalStateException("Only pending bids can be rejected");
        }

        // Update bid status
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

        log.info("Bid {} rejected successfully", bidId);
    }

    @Override
    public Bids updateBid(Long bidId, Long freelancerId, BidDTO dto) {
        log.info("Updating bid ID: {} for freelancer ID: {}", bidId, freelancerId);

        Bids existingBid = bidRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        log.info("Bid found: {}", existingBid.getId());

        if (!existingBid.getFreelancer().getId().equals(freelancerId)) {
            log.error("Freelancer is not authorized to update this bid");
            throw new RuntimeException("You can only update your own bids.");
        }
        log.info("Freelancer is authorized to update the bid");

        if (!existingBid.getStatus().equals(Bids.bidStatus.Pending)) {
            log.error("Bid is not pending, cannot update. Current status: {}", existingBid.getStatus());
            throw new RuntimeException("Only pending bids can be updated.");
        }
        log.info("Bid is pending, proceeding with update");

        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getStatus() != Project.ProjectStatus.OPEN) {
            log.error("Project is no longer open for bidding");
            throw new IllegalStateException("Project is no longer accepting bids");
        }

        if (!existingBid.getProject().getId().equals(dto.getProjectId())) {
            log.error("Cannot change project ID in bid update");
            throw new RuntimeException("Cannot change the project for an existing bid");
        }

        if (!existingBid.getFreelancer().getId().equals(dto.getFreelancerId())) {
            log.error("Cannot change freelancer ID in bid update");
            throw new RuntimeException("Cannot change the freelancer for an existing bid");
        }

        existingBid.setProposal(dto.getProposal());
        existingBid.setBidAmount(dto.getBidAmount());
        existingBid.setDurationDays(dto.getDurationDays());
        existingBid.setTeamSize(dto.getTeamSize());
        existingBid.setUpdatedAt(LocalDateTime.now());

        log.info("Bid updated successfully: {}", existingBid.getId());
        return bidRepo.save(existingBid);
    }

    public static BidResponseDTO getBidResponseDTO(Bids bid) {
        BidResponseDTO dto = new BidResponseDTO();
        dto.setBidId(bid.getId());
        dto.setFreelancerId(bid.getFreelancer().getId());
        // ✅ FIXED: Removed the problematic setProjectId line
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

    private static ProjectDTO toProjectDTO(Project project) {
        if (project == null)
            return null;

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
                project.getClient() != null ? project.getClient().getId() : null,
                project.getCreatedAt(),
                project.getUpdatedAt());
    }
}
