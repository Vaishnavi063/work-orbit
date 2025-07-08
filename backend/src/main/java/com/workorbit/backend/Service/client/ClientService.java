package com.workorbit.backend.Service.client;

import com.workorbit.backend.DTO.ClientCreateDTO;
import com.workorbit.backend.DTO.ClientDTO;

public interface ClientService {
    void createClient(ClientCreateDTO dto);
    ClientDTO getClientDTOById(Long clientId);
    boolean deleteClient(Long clientId);
}
