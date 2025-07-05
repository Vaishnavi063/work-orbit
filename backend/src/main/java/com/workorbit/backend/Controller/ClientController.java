package com.workorbit.backend.Controller;

import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Service.client.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @PostMapping("/clients")
    public Client createClient(@RequestBody Client client) {
        return clientService.createClient(client);
    }

    @GetMapping("/clients/{id}")
    public Client getClient(@PathVariable Long id) {
        return  clientService.getClient(id);
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable Long id) {
        boolean deleted = clientService.deleteClient(id);

        if (deleted) {
            return ResponseEntity.ok("Client deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Client not found");
        }
    }
}
