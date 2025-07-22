package com.workorbit.backend.Chat.Config;

import io.ably.lib.rest.AblyRest;
import io.ably.lib.types.AblyException;
import io.ably.lib.types.ClientOptions;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Ably real-time messaging service.
 * Provides Ably REST client configuration for chat functionality.
 */
@Getter
@Configuration
@Slf4j
public class AblyConfig {

    /**
     * -- GETTER --
     *  Gets the Ably API key.
     *
     * @return the Ably API key
     */
    @Value("${ably.api.key}")
    private String ablyApiKey;

    /**
     * -- GETTER --
     *  Gets the configured token TTL in seconds.
     *
     */
    @Value("${ably.token.ttl:3600}")
    private int tokenTtl;

    /**
     * Creates and configures Ably REST client bean.
     * 
     * @return AblyRest client instance
     * @throws AblyException if configuration fails
     */
    @Bean
    public AblyRest ablyRest() throws AblyException {
        // Validate that API key is not null or empty
        if (ablyApiKey == null || ablyApiKey.isEmpty()) {
            log.error("Ably API key is missing. Please check your environment variables or application properties.");
            throw new RuntimeException("Ably API key is missing");
        }
        
        // Create client options
        ClientOptions options = new ClientOptions();
        
        // Check if the key is a JWT token (starts with "eyJ") or a standard API key
        if (ablyApiKey.startsWith("eyJ")) {
            log.info("Using JWT token for Ably authentication");
            options.token = ablyApiKey;
        } else {
            log.info("Using API key for Ably authentication");
            options.key = ablyApiKey;
        }
        
        // Set additional options
        options.clientId = "workorbit-server";
        options.tls = true;
        
        return new AblyRest(options);
    }

}