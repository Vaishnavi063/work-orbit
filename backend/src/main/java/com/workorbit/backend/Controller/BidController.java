package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Service.bid.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.workorbit.backend.DTO.ApiResponse;

@RestController
@RequestMapping("/bids")
public class BidController {

    @Autowired
    private BidService bidService;

    @PostMapping
    public ResponseEntity<ApiResponse<Bids>> placeBid(@RequestBody BidDTO dto) {
        return new ResponseEntity<>(ApiResponse.success(bidService.placeBid(dto)), HttpStatus.CREATED);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<BidResponseDTO>>> getBidsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(bidService.getBidsByProjectId(projectId)));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<List<BidResponseDTO>>> getBidsByFreelancer(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(ApiResponse.success(bidService.getBidsByFreelancerId(freelancerId)));
    }

    @DeleteMapping("/{bidId}/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<String>> deleteBid(@PathVariable Long bidId, @PathVariable Long freelancerId) {
        bidService.deleteBid(bidId, freelancerId);
        return ResponseEntity.ok(ApiResponse.success("Bid deleted successfully."));
    }
}
