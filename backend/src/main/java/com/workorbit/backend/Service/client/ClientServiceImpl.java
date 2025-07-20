package com.workorbit.backend.Service.client;

import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    public ClientDTO getClientDTOById(Long id) {
        Client client = clientRepository.findById(id).orElse(null);
        if (client == null) return null;

        List<ProjectDTO> projectDTOs = new ArrayList<>();
        for (Project p : client.getProjects()) {

            ProjectDTO dto = getProjectDTO(p);

            projectDTOs.add(dto);
        }

        String email = client.getAppUser() != null ? client.getAppUser().getEmail() : null;
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
        if (!clientRepository.existsById(clientId)) return false;
        clientRepository.deleteById(clientId);
        return true;
    }
}
