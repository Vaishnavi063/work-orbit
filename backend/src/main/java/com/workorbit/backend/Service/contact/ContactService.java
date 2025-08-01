package com.workorbit.backend.Service.contact;

import com.workorbit.backend.DTO.ContactRequestDTO;
import com.workorbit.backend.DTO.ContactResponseDTO;

public interface ContactService {
    ContactResponseDTO submitContactRequest(ContactRequestDTO contactRequestDTO, Long userId);
}