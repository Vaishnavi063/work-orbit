package com.workorbit.backend.Auth.Service;

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

}