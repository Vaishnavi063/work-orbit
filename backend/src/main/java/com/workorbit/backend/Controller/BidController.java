package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Service.bid.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import com.workorbit.backend.DTO.ApiResponse;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping
    public ResponseEntity<ApiResponse<Bids>> placeBid(@Valid @RequestBody BidDTO dto) {
        return new ResponseEntity<>(ApiResponse.success(bidService.placeBid(dto)), HttpStatus.CREATED);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<List<BidResponseDTO>>> getBidsByFreelancer(@PathVariable Long freelancerId) {
        List<BidResponseDTO> bids = bidService.getBidsByFreelancerId(freelancerId);
        if (bids == null || bids.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("No bids raised by this freelancer."));
        }
        return ResponseEntity.ok(ApiResponse.success(bids));
    }

    @DeleteMapping("/{bidId}/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<String>> deleteBid(@PathVariable Long bidId, @PathVariable Long freelancerId) {
        try {
            bidService.deleteBid(bidId, freelancerId);
            return ResponseEntity.ok(ApiResponse.success("Bid deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }
}
