package com.cryptowatch.backend.scheduler;

import com.cryptowatch.backend.service.CoinMarketCapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@EnableScheduling
@ConditionalOnProperty(name = "crypto.scheduler.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class CmcScheduler {

    private final CoinMarketCapService cmcService;

    @Scheduled(fixedRateString = "${crypto.scheduler.update-interval:15}", timeUnit = TimeUnit.MINUTES)
    public void updateSnapshots() {
        if (!cmcService.isSyncEnabled()) {
            log.debug("Scheduled sync skipped: CMC_API_KEY is not configured (DB-only mode)");
            return;
        }

        log.info("Starting scheduled snapshot update...");
        var result = cmcService.refreshSnapshots(null); // all coins
        log.info("Scheduled update completed: {} snapshots saved for symbols: {}",
                result.getRefreshedCount(), result.getSymbols());
    }
}
