package com.workorbit.backend.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(
    description = "Standard API response wrapper for all endpoints in the Work-Orbit system. " +
                  "This wrapper provides a consistent response format across all API operations, " +
                  "containing either successful data or error information, but never both.",
    example = """
        {
          "status": "success",
          "data": {
            "id": 1,
            "name": "Sample Data"
          }
        }
        """
)
public class ApiResponse<T> {
    
    @Schema(
        description = "Response status indicating the outcome of the API operation. " +
                      "Will be 'success' for successful operations and 'error' for failed operations.",
        example = "success",
        allowableValues = {"success", "error"},
        required = true
    )
    private String status;
    
    @Schema(
        description = "Response data containing the actual result of the API operation. " +
                      "This field is present only when status is 'success' and contains the " +
                      "requested resource or operation result. The type varies based on the endpoint.",
        nullable = true,
        example = """
            {
              "id": 123,
              "email": "user@example.com",
              "role": "FREELANCER"
            }
            """
    )
    private T data;
    
    @Schema(
        description = "Error information containing details about what went wrong during the API operation. " +
                      "This field is present only when status is 'error' and provides structured error details " +
                      "to help clients understand and handle the failure appropriately.",
        nullable = true,
        example = """
            {
              "message": "Validation failed",
              "details": "Email is required and must be valid",
              "field": "email"
            }
            """
    )
    private Object error;

    /**
     * Creates a successful API response with the provided data
     * 
     * @param <T> The type of data being returned
     * @param data The data to include in the successful response
     * @return ApiResponse with status "success" and the provided data
     */
    @Schema(hidden = true) // Hide from OpenAPI as this is a factory method
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus("success");
        response.setData(data);
        return response;
    }

    /**
     * Creates an error API response with the provided error information
     * 
     * @param <T> The expected data type (unused in error responses)
     * @param error The error information to include in the response
     * @return ApiResponse with status "error" and the provided error details
     */
    @Schema(hidden = true) // Hide from OpenAPI as this is a factory method
    public static <T> ApiResponse<T> error(Object error) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus("error");
        response.setError(error);
        return response;
    }

    public boolean isSuccess() {
        return "success".equals(status);
    }

    /**
     * Schema representation for successful API responses
     */
    @Schema(
        description = "Successful API response containing requested data",
        example = """
            {
              "status": "success",
              "data": {
                "id": 1,
                "name": "Sample Resource"
              }
            }
            """
    )
    public static class SuccessResponse {
        @Schema(description = "Always 'success' for successful responses", example = "success")
        private String status = "success";
        
        @Schema(description = "The requested data or operation result")
        private Object data;
    }

    /**
     * Schema representation for error API responses
     */
    @Schema(
        description = "Error API response containing error details",
        example = """
            {
              "status": "error",
              "error": {
                "message": "Operation failed",
                "details": "Detailed error description"
              }
            }
            """
    )
    public static class ErrorResponse {
        @Schema(description = "Always 'error' for error responses", example = "error")
        private String status = "error";
        
        @Schema(description = "Error information with details about the failure")
        private Object error;
    }
}