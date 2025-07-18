package com.workorbit.backend.Auth.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

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

        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("frontendUrl", frontendUrl);

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

            mailSender.send(message);
            System.out.printf("Password reset email sent to %s%n", recipientEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.printf("Failed to send password reset email to %s: %s%n", recipientEmail, e.getMessage());
        }
    }

}