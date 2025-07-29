package com.workorbit.backend.Auth.Service;

import com.workorbit.backend.Entity.Contract;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String recipientEmail, String resetToken, String userName) {
        log.info("Sending password reset email to: {}", recipientEmail);
        try {
            String resetUrl = frontendUrl + "/auth/reset-password?token=" + resetToken;
            log.info("Reset URL: {}", resetUrl);

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("frontendUrl", frontendUrl);
            context.setVariable("currentDate", java.time.LocalDateTime.now());

            String emailContent = templateEngine.process("email/password-reset-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            String fromName = "WorkOrbit Team";
            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("Reset Your WorkOrbit Password");
            helper.setText(emailContent, true);
            log.info("Email message created");

            mailSender.send(message);
            log.info("Password reset email sent to {}", recipientEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send password reset email to {}: {}", recipientEmail, e.getMessage());
        }
    }

    @Async
    public void sendContractCreatedNotification(Contract contract) {
        log.info("Sending contract created notifications for contract ID: {}", contract.getContractId());
        
        try {
            // Send to client
            sendContractCreatedEmail(
                contract.getProject().getClient().getAppUser().getEmail(),
                contract,
                "CLIENT"
            );
            
            // Send to freelancer  
            sendContractCreatedEmail(
                contract.getBid().getFreelancer().getAppUser().getEmail(),
                contract,
                "FREELANCER"
            );
            
            log.info("Contract created notifications sent successfully for contract: {}", contract.getContractId());
        } catch (Exception e) {
            log.error("Failed to send contract created notifications for contract {}: {}", 
                contract.getContractId(), e.getMessage());
        }
    }

    @Async
    public void sendContractCompletedNotification(Contract contract, Double rating) {
        log.info("Sending contract completed notifications for contract ID: {}", contract.getContractId());
        
        try {
            // Send to client
            sendContractCompletedEmail(
                contract.getProject().getClient().getAppUser().getEmail(),
                contract,
                rating,
                "CLIENT"
            );
            
            // Send to freelancer
            sendContractCompletedEmail(
                contract.getBid().getFreelancer().getAppUser().getEmail(),
                contract,
                rating,
                "FREELANCER"
            );
            
            log.info("Contract completed notifications sent successfully for contract: {}", contract.getContractId());
        } catch (Exception e) {
            log.error("Failed to send contract completed notifications for contract {}: {}", 
                contract.getContractId(), e.getMessage());
        }
    }

    private void sendContractCreatedEmail(String recipientEmail, Contract contract, String userRole) {
        log.info("Sending contract created email to: {} ({})", recipientEmail, userRole);
        try {
            String userName = getUserNameFromContract(contract, userRole);

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("userRole", userRole);
            context.setVariable("contractId", contract.getContractId());
            context.setVariable("projectName", contract.getProject().getTitle());
            context.setVariable("clientName", contract.getProject().getClient().getName());
            context.setVariable("freelancerName", contract.getBid().getFreelancer().getName());
            context.setVariable("bidAmount", contract.getBid().getBidAmount());
            context.setVariable("frontendUrl", frontendUrl);
            context.setVariable("currentDate", LocalDateTime.now());

            String emailContent = templateEngine.process("email/contract-created-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            String fromName = "WorkOrbit Team";
            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("🎉 Contract Created - " + contract.getProject().getTitle() + " | WorkOrbit");
            helper.setText(emailContent, true);

            mailSender.send(message);
            log.info("Contract created email sent to {} ({})", recipientEmail, userRole);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send contract created email to {} ({}): {}", recipientEmail, userRole, e.getMessage());
        }
    }

    private void sendContractCompletedEmail(String recipientEmail, Contract contract, Double rating, String userRole) {
        log.info("Sending contract completed email to: {} ({})", recipientEmail, userRole);
        try {
            String userName = getUserNameFromContract(contract, userRole);
            String contractDuration = calculateContractDuration(contract);

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("userRole", userRole);
            context.setVariable("contractId", contract.getContractId());
            context.setVariable("projectName", contract.getProject().getTitle());
            context.setVariable("clientName", contract.getProject().getClient().getName());
            context.setVariable("freelancerName", contract.getBid().getFreelancer().getName());
            context.setVariable("bidAmount", contract.getBid().getBidAmount());
            context.setVariable("freelancerRating", rating);
            context.setVariable("contractDuration", contractDuration);
            context.setVariable("frontendUrl", frontendUrl);
            context.setVariable("currentDate", LocalDateTime.now());

            String emailContent = templateEngine.process("email/contract-completed-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            String fromName = "WorkOrbit Team";
            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("✅ Contract Completed - " + contract.getProject().getTitle() + " | WorkOrbit");
            helper.setText(emailContent, true);

            mailSender.send(message);
            log.info("Contract completed email sent to {} ({})", recipientEmail, userRole);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send contract completed email to {} ({}): {}", recipientEmail, userRole, e.getMessage());
        }
    }

    private String getUserNameFromContract(Contract contract, String userRole) {
        if ("CLIENT".equals(userRole)) {
            return contract.getProject().getClient().getName();
        } else if ("FREELANCER".equals(userRole)) {
            return contract.getBid().getFreelancer().getName();
        }
        return "User";
    }

    private String calculateContractDuration(Contract contract) {
        if (contract.getCreatedAt() != null && contract.getUpdatedAt() != null) {
            Duration duration = Duration.between(contract.getCreatedAt(), contract.getUpdatedAt());
            long days = duration.toDays();
            if (days == 0) {
                long hours = duration.toHours();
                return hours + " hour" + (hours != 1 ? "s" : "");
            }
            return days + " day" + (days != 1 ? "s" : "");
        }
        return "N/A";
    }

}