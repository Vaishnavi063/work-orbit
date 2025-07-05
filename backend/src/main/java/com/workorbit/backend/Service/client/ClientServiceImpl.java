package com.workorbit.backend.Service.client;

import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Repository.ClientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService{
    private final ClientRepository clientRepository;

    @Override
    public Client createClient(Client client) {
        if (clientRepository.existsByEmail(client.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }
        return clientRepository.save(client);
    }


    public Client getClient(Long clientId) {
        if(!clientRepository.existsById(clientId)) {
            throw  new RuntimeException("Client Not Found");
        }
        return clientRepository.findById(clientId).get();
    }

    public boolean deleteClient(Long clientId) {
        if(!clientRepository.existsById(clientId)) return false;
        clientRepository.deleteById(clientId);
        return true;
    }

}
