package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.Service.client.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/client")
public class ClientController {
    private final ClientService clientService;

    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClient(@PathVariable Long id) {
        ClientDTO dto = clientService.getClientDTOById(id);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable Long id) {
        boolean deleted = clientService.deleteClient(id);
        return deleted ?
                ResponseEntity.ok("Client deleted successfully") :
                ResponseEntity.status(HttpStatus.NOT_FOUND).body("Client not found");
    }
}
