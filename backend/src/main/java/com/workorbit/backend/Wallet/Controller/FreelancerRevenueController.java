package com.workorbit.backend.Wallet.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Wallet.DTO.FreelancerRevenueDTO;
import com.workorbit.backend.Wallet.Service.FreelancerRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/freelancer/revenue")
@RequiredArgsConstructor
public class FreelancerRevenueController {

    private final FreelancerRevenueService revenueService;

    @GetMapping("/{freelancerId}")
    public ResponseEntity<ApiResponse<FreelancerRevenueDTO>> getFreelancerRevenue(
            @PathVariable Long freelancerId
    ) {
        FreelancerRevenueDTO revenue = revenueService.getFreelancerRevenue(freelancerId);
        return ResponseEntity.ok(ApiResponse.success(revenue));
    }
}