package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    description = "Response after successfully submitting a contact form",
    example = """
        {
          "id": 123,
          "status": "RECEIVED",
          "confirmationSent": true,
          "createdAt": "2025-01-08T10:30:00"
        }
        """
)
public class ContactResponseDTO {
    
    @Schema(
        description = "Unique identifier for the contact request",
        example = "123",
        required = true
    )
    private Long id;
    
    @Schema(
        description = "Current status of the contact request",
        example = "RECEIVED",
        allowableValues = {"RECEIVED", "PROCESSING", "RESOLVED"},
        required = true
    )
    private String status;
    
    @Schema(
        description = "Whether a confirmation email was sent to the user",
        example = "true",
        required = true
    )
    private Boolean confirmationSent;
    
    @Schema(
        description = "Timestamp when the contact request was created",
        example = "2025-01-08T10:30:00",
        required = true
    )
    private LocalDateTime createdAt;
}