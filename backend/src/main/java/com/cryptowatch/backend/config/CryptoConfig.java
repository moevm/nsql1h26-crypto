package com.cryptowatch.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "crypto")
@Data
public class CryptoConfig {
    private Scheduler scheduler = new Scheduler();
    
    @Data
    public static class Scheduler {
        private boolean enabled = true;
        private int updateInterval = 15; // minutes
    }
}