package com.workorbit.backend.Chat.Config;

import io.ably.lib.rest.AblyRest;
import io.ably.lib.types.AblyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Ably real-time messaging service.
 * Provides Ably REST client configuration for chat functionality.
 */
@Configuration
public class AblyConfig {

    @Value("${ably.api.key}")
    private String ablyApiKey;

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
        return new AblyRest(ablyApiKey);
    }

    /**
     * Gets the configured token TTL in seconds.
     * 
     * @return token time-to-live in seconds
     */
    public int getTokenTtl() {
        return tokenTtl;
    }
}