package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContactRequestDTO;
import com.workorbit.backend.DTO.ContactResponseDTO;
import com.workorbit.backend.Service.contact.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Contact", description = "Contact form operations for user inquiries and support requests")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact")
@Slf4j
public class ContactController {

    private final ContactService contactService;

    @Operation(
        summary = "Submit contact form",
        description = "Submits a contact form request. Can be used by both logged-in users and guests. " +
                     "For logged-in users, authentication is optional but recommended for better tracking."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Contact request submitted successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid contact form data provided",
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
    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponseDTO>> submitContactForm(
        @Parameter(description = "Contact form data", required = true)
        @Valid @RequestBody ContactRequestDTO contactRequestDTO,
        HttpServletRequest request
    ) {
        try {
            log.info("Received contact form submission from: {}", contactRequestDTO.getEmail());
            
            // Extract user ID from request if available (for logged-in users)
            Long userId = extractUserIdFromRequest(request);
            
            ContactResponseDTO response = contactService.submitContactRequest(contactRequestDTO, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response));
                    
        } catch (IllegalArgumentException e) {
            log.error("Invalid contact form data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid form data: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing contact form submission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit contact form. Please try again later."));
        }
    }

    private Long extractUserIdFromRequest(HttpServletRequest request) {
        try {
            // Try to get user ID from request attribute (set by JWT filter)
            Object userIdAttr = request.getAttribute("userId");
            if (userIdAttr != null) {
                return Long.valueOf(userIdAttr.toString());
            }
            
            // If not found in attributes, user is likely not authenticated
            return null;
        } catch (Exception e) {
            log.debug("Could not extract user ID from request: {}", e.getMessage());
            return null;
        }
    }
}