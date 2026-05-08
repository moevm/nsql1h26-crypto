package com.cryptowatch.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "crypto")
@Data
public class CryptoConfig {
    private Scheduler scheduler = new Scheduler();
    private History history = new History();

    @Data
    public static class Scheduler {
        private boolean enabled = true;
        private int updateInterval = 15; // minutes
    }

    @Data
    public static class History {
        private boolean enabled = false;
        private int defaultDays = 7;
        private String defaultInterval = "hourly"; // hourly, daily, weekly
    }
}