package com.workorbit.backend.Service.bid;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.Entity.Bids;

import java.util.List;

public interface BidService {
    Bids placeBid(BidDTO dto);
    List<BidResponseDTO> getBidsByFreelancerId(Long freelancerId);
    void deleteBid(Long bidId, Long freelancerId);
    Bids updateBid(Long bidId, Long freelancerId, BidDTO dto);
}