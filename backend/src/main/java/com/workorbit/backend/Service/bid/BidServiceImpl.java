package com.workorbit.backend.Service.bid;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.FreelancerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidServiceImpl implements BidService {

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private FreelancerRepository freelancerRepo;
    @Autowired
    private com.workorbit.backend.Repository.ProjectRepository projectRepo;

    @Override
    public Bids placeBid(BidDTO dto) {
        // Fetch freelancer
        Freelancer freelancer = freelancerRepo.findById(dto.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer not found"));

        // Fetch project
        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ✅ Check project status
        if (project.getStatus() != Project.ProjectStatus.OPEN) {
            throw new IllegalStateException("Bids can only be placed on projects with status OPEN");
        }

        // ✅ Check if freelancer already placed a bid on this project
        boolean alreadyBid = bidRepo.existsByFreelancerIdAndProjectId(dto.getFreelancerId(), dto.getProjectId());
        if (alreadyBid) {
            throw new IllegalStateException("Freelancer has already placed a bid on this project");
        }

        // Create and save bid
        Bids bid = new Bids();
        bid.setFreelancer(freelancer);
        bid.setProject(project);
        bid.setProposal(dto.getProposal());
        bid.setBidAmount(dto.getBidAmount());
        bid.setDurationDays(dto.getDurationDays());
        bid.setStatus(Bids.bidStatus.Pending);
        bid.setCreatedAt(LocalDateTime.now());

        return bidRepo.save(bid);
    }


    @Override
    public List<BidResponseDTO> getBidsByFreelancerId(Long freelancerId) {
        // Fetch and map all bids for a freelancer to DTOs
        return bidRepo.findByFreelancer_Id(freelancerId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public void deleteBid(Long bidId, Long freelancerId) {
        // Find the bid and check if the freelancer is authorized to delete it
        Bids bid = bidRepo.findById(bidId).orElseThrow(() -> new RuntimeException("Bid not found"));
        if (!bid.getFreelancer().getId().equals(freelancerId)) {
            throw new RuntimeException("You can only delete your own bids.");
        }
        if (!bid.getStatus().equals(Bids.bidStatus.Pending)) {
            throw new RuntimeException("Only pending bids can be deleted.");
        }
        bidRepo.deleteById(bidId);
    }

    // Helper method to map a Bid entity to a BidResponseDTO
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
