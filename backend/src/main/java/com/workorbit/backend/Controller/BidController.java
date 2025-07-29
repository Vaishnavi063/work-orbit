package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.BidDTO;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Service.bid.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import java.util.List;
import com.workorbit.backend.DTO.ApiResponse;

@Tag(name = "Bid Management", description = "Operations for managing bids on projects including creating, updating, retrieving, and deleting bids")
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @Operation(
        summary = "Place a new bid on a project",
        description = "Allows a freelancer to submit a bid on a project with proposal details, amount, duration, and team size requirements"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Bid placed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid bid data or validation errors",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to place bid",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Project or freelancer not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<ApiResponse<Bids>> placeBid(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Bid details including freelancer ID, project ID, proposal, amount, duration, and team size",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = BidDTO.class)
            )
        )
        @Valid @RequestBody BidDTO dto) {
        return new ResponseEntity<>(ApiResponse.success(bidService.placeBid(dto)), HttpStatus.CREATED);
    }

    @Operation(
        summary = "Get all bids by freelancer",
        description = "Retrieves all bids submitted by a specific freelancer with complete project and bid details"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Bids retrieved successfully (may be empty list if no bids found)",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to view bids",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Freelancer not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<List<BidResponseDTO>>> getBidsByFreelancer(
        @Parameter(
            description = "ID of the freelancer whose bids to retrieve",
            required = true,
            example = "1"
        )
        @PathVariable Long freelancerId) {
        List<BidResponseDTO> bids = bidService.getBidsByFreelancerId(freelancerId);
        if (bids == null || bids.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("No bids raised by this freelancer."));
        }
        return ResponseEntity.ok(ApiResponse.success(bids));
    }

    @Operation(
        summary = "Delete a bid",
        description = "Allows a freelancer to delete their own bid on a project. Only the bid owner can delete their bid."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Bid deleted successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request or bid cannot be deleted",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions - can only delete own bids",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Bid or freelancer not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{bidId}/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<String>> deleteBid(
        @Parameter(
            description = "ID of the bid to delete",
            required = true,
            example = "1"
        )
        @PathVariable Long bidId,
        @Parameter(
            description = "ID of the freelancer who owns the bid",
            required = true,
            example = "1"
        )
        @PathVariable Long freelancerId) {
        try {
            bidService.deleteBid(bidId, freelancerId);
            return ResponseEntity.ok(ApiResponse.success("Bid deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(
        summary = "Update an existing bid",
        description = "Allows a freelancer to update their existing bid with new proposal details, amount, duration, or team size. Only the bid owner can update their bid."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Bid updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid bid data or validation errors",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions - can only update own bids",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Bid or freelancer not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{bidId}/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<Bids>> updateBid(
            @Parameter(
                description = "ID of the bid to update",
                required = true,
                example = "1"
            )
            @PathVariable Long bidId,
            @Parameter(
                description = "ID of the freelancer who owns the bid",
                required = true,
                example = "1"
            )
            @PathVariable Long freelancerId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Updated bid details including proposal, amount, duration, and team size",
                required = true,
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = BidDTO.class)
                )
            )
            @Valid @RequestBody BidDTO dto) {
        try {
            Bids updatedBid = bidService.updateBid(bidId, freelancerId, dto);
            return ResponseEntity.ok(ApiResponse.success(updatedBid));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }
}
