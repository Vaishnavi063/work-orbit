package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.Service.client.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/client")
public class ClientController {

    private final ClientService clientService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClientDTO>> getClient(@PathVariable Long id) {
        ClientDTO dto = clientService.getClientDTOById(id);
        if (dto == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Client not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteClient(@PathVariable Long id) {
        boolean deleted = clientService.deleteClient(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("Client deleted successfully"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Client not found"));
        }
    }
}