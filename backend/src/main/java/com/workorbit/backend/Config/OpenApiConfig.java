package com.workorbit.backend.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI configuration for Work-Orbit API documentation
 * Configures Swagger UI with JWT authentication and API metadata
 */
@Configuration
public class OpenApiConfig {

    /**
     * Configures the OpenAPI specification with API metadata, security schemes, and server information
     * 
     * @return OpenAPI configuration object
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Work-Orbit API")
                        .version("1.0.0")
                        .description("Comprehensive API for Work-Orbit freelancing platform. " +
                                   "This API provides endpoints for user authentication, project management, " +
                                   "bidding system, contract management, wallet operations, and freelancer services.")
                        .contact(new Contact()
                                .name("Work-Orbit Development Team")
                                .email("dev@workorbit.com")
                                .url("https://workorbit.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:10007")
                                .description("Development server")
                        ))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Bearer token authentication. " +
                                                   "Obtain token from /api/auth/login endpoint and include it in the Authorization header.")));
    }
}