package com.workorbit.backend.Service.contract;

import java.util.List;
import java.util.stream.Collectors;

import com.workorbit.backend.Auth.Service.EmailService;
import com.workorbit.backend.Chat.Scheduler.ChatScheduler;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Wallet.Service.WalletService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ContractRepository;
import com.workorbit.backend.Chat.Service.ChatService;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final WalletService walletService;
    private final ChatService chatService;
    private final ChatScheduler chatScheduler;
    private final EmailService emailService;

    @Override
    @Transactional
    public Long createContract(Bids bid) {
        log.info("Creating contract for bid ID: {}", bid.getId());

        // Fetch the associated project from the bid
        Project project = bid.getProject();
        log.info("Project found: {}", project.getTitle());

        if (project == null) {
            log.error("Project associated with the bid not found.");
            throw new RuntimeException("Project associated with the bid not found.");
        }

        Contract contract = new Contract();
        contract.setProject(project);
        contract.setBid(bid);

        Contract savedContract = contractRepository.save(contract);
        log.info("Contract saved: {}", savedContract.getContractId());

        // Handle chat room creation/conversion
        // First try to convert existing bid chat to contract chat
        try {
            chatService.convertToContractChat(bid.getId(), savedContract.getContractId());
            log.info("Bid chat converted to contract chat for bid: {} and contract: {}", bid.getId(),
                    savedContract.getContractId());
        } catch (Exception e) {
            log.warn(
                    "Failed to convert bid chat to contract chat for bid: {} and contract: {}, trying legacy method and fallback",
                    bid.getId(), savedContract.getContractId(), e);

            // Try legacy method as fallback
            try {
                chatService.transitionBidChatToContract(bid.getId(), savedContract.getContractId());
                log.info("Legacy bid chat transition succeeded for bid: {} and contract: {}", bid.getId(),
                        savedContract.getContractId());
            } catch (Exception ex) {
                log.warn(
                        "Legacy bid chat transition also failed for bid: {} and contract: {}, creating new contract chat",
                        bid.getId(), savedContract.getContractId(), ex);

                // If both conversion methods fail, create a new contract chat
                try {
                    chatService.createContractChat(savedContract.getContractId());
                    log.info("New contract chat created for contract ID: {}", savedContract.getContractId());
                } catch (Exception finalEx) {
                    log.error("Failed to create contract chat for contract ID: {}", savedContract.getContractId(),
                            finalEx);
                    // Don't fail the contract creation if chat creation fails
                }
            }
        }

        // Send email notifications
        try {
            emailService.sendContractCreatedNotification(savedContract);
            log.info("Contract created email notifications sent for contract: {}", savedContract.getContractId());
        } catch (Exception e) {
            log.error("Failed to send contract created emails for contract: {}", savedContract.getContractId(), e);
        }

        toDTO(savedContract);
        return savedContract.getContractId();
    }

    @Override
    public ApiResponse<List<ContractResponse>> getAllContracts() {
        List<Contract> contracts = contractRepository.findAll();
        log.info("Found {} contracts", contracts.size());
        List<ContractResponse> responseList = contracts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        log.info("Contracts mapped: {}", responseList);
        return ApiResponse.success(responseList);
    }

    public ApiResponse<ContractResponse> getContractById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        log.info("Contract found: {}", contract.getContractId());
        return ApiResponse.success(toDTO(contract));
    }

    @Override
    @Transactional
    public ApiResponse<ContractResponse> updateContract(Long id, String contractUpdatePayload) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Contract.ContractStatus oldStatus = contract.getContractStatus();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(contractUpdatePayload);
            String contractStatus = node.has("contractStatus") ? node.get("contractStatus").asText() : null;
            Double freelancerRating = node.has("freelancerRating") && !node.get("freelancerRating").isNull()
                    ? node.get("freelancerRating").asDouble()
                    : null;

            Contract.ContractStatus newStatus = null;
            if (contractStatus != null) {
                try {
                    newStatus = Contract.ContractStatus.valueOf(contractStatus);
                    contract.setContractStatus(newStatus);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid contract status");
                }
            }

            if (freelancerRating != null) {
                contract.setFreelancerRating(freelancerRating);
            }

            Contract updated = contractRepository.save(contract);

            if (updated.getContractStatus() == Contract.ContractStatus.COMPLETED && freelancerRating != null) {
                // Update freelancer's average rating
                Freelancer freelancer = updated.getBid().getFreelancer();
                if (freelancer != null) {
                    Double oldAvg = freelancer.getRating() != null ? freelancer.getRating() : 0.0;
                    int ratingCount = 0;
                    if (freelancer.getRating() != null && freelancer.getRating() > 0.0) {
                        // Count previous ratings by counting completed contracts with a rating
                        ratingCount = (int) contractRepository.findAll().stream()
                                .filter(c -> c.getBid().getFreelancer().getId().equals(freelancer.getId()))
                                .filter(c -> c.getFreelancerRating() != null)
                                .count();
                    }
                    double newAvg = (oldAvg * ratingCount + freelancerRating) / (ratingCount + 1);
                    freelancer.setRating(newAvg);
                }
            }

            if (updated.getContractStatus() == Contract.ContractStatus.COMPLETED) {
                Long clientId = updated.getProject().getClient().getId();
                Long freelancerId = updated.getBid().getFreelancer().getId();
                Long projectId = updated.getProject().getId();
                Double amount = updated.getBid().getBidAmount();

                log.info("Releasing payment of {} from client {} to freelancer {} for project {} contract {}",
                        amount, clientId, freelancerId, projectId, updated.getContractId());

                walletService.releasePayment(clientId, freelancerId, projectId, amount);

                // Send contract completion email notifications
                try {
                    emailService.sendContractCompletedNotification(updated, freelancerRating);
                    log.info("Contract completed email notifications sent for contract: {}", updated.getContractId());
                } catch (Exception e) {
                    log.error("Failed to send contract completed emails for contract: {}", updated.getContractId(), e);
                }
            }

            // Send system notification to contract chat about status change in a separate
            // transaction
            // This ensures that chat failures don't rollback the contract update
            if (newStatus != null) {
                try {
                    String notification = String.format("Contract status changed from %s to %s",
                            oldStatus.toString(), newStatus.toString());
                    chatService.sendSystemNotification(updated.getContractId(), notification);
                    log.info("System notification sent for contract status change: {}", updated.getContractId());
                } catch (Exception e) {
                    log.error("Failed to send system notification for contract status change: {}",
                            updated.getContractId(), e);
                    // Don't fail the contract update if chat notification fails
                }

                // If contract is completed or cancelled, mark the chat room for archiving in a
                // separate transaction
                if (newStatus == Contract.ContractStatus.COMPLETED) {
                    try {
                        chatScheduler.markContractChatForArchiving(updated.getContractId());
                        log.info("Chat room marked for archiving for contract: {}", updated.getContractId());
                    } catch (Exception e) {
                        log.error("Failed to mark chat room for archiving for contract: {}", updated.getContractId(),
                                e);
                        // Don't fail the contract update if chat archiving fails
                    }
                }
            }

            return ApiResponse.success(toDTO(updated));
        } catch (Exception e) {
            throw new RuntimeException("Invalid contract update payload", e);
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Close any associated chat rooms before deleting the contract
        try {
            chatService.sendSystemNotification(contract.getContractId(),
                    "Contract is being deleted. This chat will be closed.");
        } catch (Exception e) {
            log.error("Failed to send notification before contract deletion: {}", contract.getContractId(), e);
        }

        contractRepository.delete(contract);
        return ApiResponse.success("Contract deleted successfully");
    }

    private ContractResponse toDTO(Contract contract) {
        Project project = contract.getProject();
        Client client = project.getClient();
        String clientName = client != null ? client.getName() : "Unknown Client";
        Long clientId = client != null ? client.getId() : null;

        Freelancer freelancer = contract.getBid() != null ? contract.getBid().getFreelancer() : null;
        String freelancerName = freelancer != null ? freelancer.getName() : "Unknown Freelancer";
        Long freelancerId = freelancer != null ? freelancer.getId() : null;

        return ContractResponse.builder()
                .contractId(contract.getContractId())
                .projectId(project.getId())
                .projectName(project.getTitle())
                .clientId(clientId)
                .freelancerId(freelancerId)
                .clientName(clientName)
                .freelancerName(freelancerName)
                .bidId(contract.getBid().getId())
                .bidAmount(contract.getBid().getBidAmount())
                .contractStatus(contract.getContractStatus().name())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
