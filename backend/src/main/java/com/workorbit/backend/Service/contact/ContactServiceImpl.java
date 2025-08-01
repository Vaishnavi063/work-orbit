package com.workorbit.backend.Service.contact;

import com.workorbit.backend.Auth.Service.EmailService;
import com.workorbit.backend.DTO.ContactRequestDTO;
import com.workorbit.backend.DTO.ContactResponseDTO;
import com.workorbit.backend.Entity.ContactRequest;
import com.workorbit.backend.Repository.ContactRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRequestRepository contactRequestRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public ContactResponseDTO submitContactRequest(ContactRequestDTO contactRequestDTO, Long userId) {
        log.info("Submitting contact request from email: {}", contactRequestDTO.getEmail());
        
        // Create contact request entity
        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setEmail(contactRequestDTO.getEmail());
        contactRequest.setSubject(contactRequestDTO.getSubject());
        contactRequest.setMessage(contactRequestDTO.getMessage());
        
        // Set user type
        try {
            contactRequest.setUserType(ContactRequest.UserType.valueOf(contactRequestDTO.getUserType()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid user type: {}", contactRequestDTO.getUserType());
            throw new IllegalArgumentException("Invalid user type: " + contactRequestDTO.getUserType());
        }
        
        // Set user ID if provided (for logged-in users)
        if (userId != null) {
            contactRequest.setUserId(userId);
        }
        
        // Save the contact request
        ContactRequest savedRequest = contactRequestRepository.save(contactRequest);
        log.info("Contact request saved with ID: {}", savedRequest.getId());
        
        // Send confirmation email
        try {
            emailService.sendContactConfirmationEmail(savedRequest);
            savedRequest.setConfirmationSent(true);
            log.info("Confirmation email sent successfully for contact request ID: {}", savedRequest.getId());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for contact request ID: {}", savedRequest.getId(), e);
            savedRequest.setConfirmationSent(false);
        }
        
        // Update the confirmation status
        contactRequestRepository.save(savedRequest);
        
        // Return response DTO
        return new ContactResponseDTO(
            savedRequest.getId(),
            savedRequest.getStatus().toString(),
            savedRequest.getConfirmationSent(),
            savedRequest.getCreatedAt()
        );
    }
}