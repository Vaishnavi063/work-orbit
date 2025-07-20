package com.workorbit.backend.Service.client;

import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    public ClientDTO getClientDTOById(Long id) {
        log.info("Fetching client by ID: {}", id);
        Client client = clientRepository.findById(id).orElse(null);

        if (client == null) {
            log.error("Client not found with ID: {}", id);
            return null;
        }
        log.info("Client found: {}", client.getName());

        log.info("Fetching projects for client: {}", client.getName());
        List<ProjectDTO> projectDTOs = new ArrayList<>();

        for (Project p : client.getProjects()) {
            log.info("Project found: {}", p.getTitle());
            ProjectDTO dto = getProjectDTO(p);
            log.info("Project DTO created: {}", dto.getTitle());
            projectDTOs.add(dto);
        }
        log.info("Projects mapped: {}", projectDTOs);

        String email = client.getAppUser() != null ? client.getAppUser().getEmail() : null;
        log.info("Client email: {}", email);
        return new ClientDTO(client.getName(), email, projectDTOs);
    }

    private static ProjectDTO getProjectDTO(Project p) {
        Long clientId = (p.getClient() != null) ? p.getClient().getId() : null;
        Integer bidCount = (p.getBids() != null) ? p.getBids().size() : 0;

        return new ProjectDTO(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getCategory(),
                p.getDeadline(),
                p.getBudget(),
                p.getStatus(),
                clientId,
                p.getCreatedAt(),
                p.getUpdatedAt(),
                bidCount
        );
    }

    @Override
    public boolean deleteClient(Long clientId) {
        log.info("Deleting client by ID: {}", clientId);
        if (!clientRepository.existsById(clientId)) {
            log.error("Client not found with ID: {}", clientId);
            return false;
        }

        log.info("Client found with ID: {}", clientId);
        clientRepository.deleteById(clientId);
        log.info("Client deleted: {}", clientId);
        return true;
    }
}
