package com.workorbit.backend.Service.client;

import com.workorbit.backend.Entity.Client;

public interface ClientService {
    Client createClient(Client client);
    Client getClient(Long clientId);
    boolean deleteClient(Long clientId);
}
