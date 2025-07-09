package com.workorbit.backend.Service.client;

import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import com.workorbit.backend.DTO.ClientCreateDTO;
import com.workorbit.backend.DTO.ClientDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void createClient(ClientCreateDTO dto) {

        if (appUserRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists.");
        }

        AppUser appUser = new AppUser();
        appUser.setEmail(dto.getEmail());
        appUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        appUser.setRole(Role.ROLE_CLIENT);

        Client client = new Client();
        client.setName(dto.getName());
        client.setAppUser(appUser);

        appUser.setClientProfile(client);

        clientRepository.save(client);
    }

    @Override
    public ClientDTO getClientDTOById(Long id) {
        Client client = clientRepository.findById(id).orElse(null);
        if (client == null) return null;

        List<ProjectDTO> projectDTOs = new ArrayList<>();
        for (Project p : client.getProjects()) {
            Long clientId = (p.getClient() != null) ? p.getClient().getId() : null;

            ProjectDTO dto = new ProjectDTO(
                    p.getId(),
                    p.getTitle(),
                    p.getDescription(),
                    p.getDeadline(),
                    p.getBudget(),
                    p.getStatus(),
                    clientId
            );

            projectDTOs.add(dto);
        }

        String email = client.getAppUser() != null ? client.getAppUser().getEmail() : null;
        return new ClientDTO(client.getName(), email, projectDTOs);
    }

    @Override
    public boolean deleteClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) return false;
        clientRepository.deleteById(clientId);
        return true;
    }
}
