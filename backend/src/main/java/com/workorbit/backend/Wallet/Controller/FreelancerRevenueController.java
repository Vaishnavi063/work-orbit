package com.workorbit.backend.Wallet.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Wallet.DTO.FreelancerRevenueDTO;
import com.workorbit.backend.Wallet.Service.FreelancerRevenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Freelancer Revenue", description = "Freelancer revenue tracking and analytics endpoints")
@RestController
@RequestMapping("/api/freelancer/revenue")
@RequiredArgsConstructor
public class FreelancerRevenueController {

    private final FreelancerRevenueService revenueService;

    @Operation(
        summary = "Get freelancer revenue details",
        description = "Retrieve comprehensive revenue information for a specific freelancer including total earnings, current balance, completed projects, and transaction history"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Revenue details retrieved successfully - returns comprehensive revenue analytics"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - malformed freelancer ID or invalid parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "Authentication required - valid JWT token must be provided"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403", 
            description = "Access forbidden - insufficient permissions to access revenue data"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Freelancer not found - no freelancer exists with the provided ID"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error - unexpected error occurred while processing request"
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{freelancerId}")
    public ResponseEntity<ApiResponse<FreelancerRevenueDTO>> getFreelancerRevenue(
            @Parameter(
                description = "Unique identifier of the freelancer to retrieve revenue information for",
                required = true,
                example = "1"
            )
            @PathVariable Long freelancerId
    ) {
        FreelancerRevenueDTO revenue = revenueService.getFreelancerRevenue(freelancerId);
        return ResponseEntity.ok(ApiResponse.success(revenue));
    }
}