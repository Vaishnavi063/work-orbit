package com.workorbit.backend.Service.client;

import com.workorbit.backend.DTO.ClientDTO;

public interface ClientService {
    ClientDTO getClientDTOById(Long clientId);
    boolean deleteClient(Long clientId);
}
