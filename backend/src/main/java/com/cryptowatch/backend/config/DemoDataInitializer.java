package com.cryptowatch.backend.config;

import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.model.StatisticsPreset;
import com.cryptowatch.backend.model.User;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.cryptowatch.backend.repository.StatisticsPresetRepository;
import com.cryptowatch.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private static final int SNAPSHOT_INTERVAL_MINUTES = 15;
    private static final int SNAPSHOT_DAYS = 7;
    private static final int SNAPSHOTS_PER_COIN = SNAPSHOT_DAYS * 24 * (60 / SNAPSHOT_INTERVAL_MINUTES);

    private final UserRepository userRepository;
    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository coinSnapshotsRepository;
    private final StatisticsPresetRepository statisticsPresetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCoins();
        seedSnapshots();
        seedStatisticsPreset();
    }

    private void seedUsers() {
        if (userRepository.findByLogin("user").isEmpty()) {
            userRepository.save(buildUser(
                    "user",
                    "User123!",
                    "ROLE_USER",
                    List.of("BTC", "ETH", "SOL"),
                    List.of("BTC")
            ));
        }

        if (userRepository.findByLogin("admin").isEmpty()) {
            userRepository.save(buildUser(
                    "admin",
                    "Admin123!",
                    "ROLE_ADMIN",
                    List.of("BTC", "ETH", "SOL", "ADA", "DOGE"),
                    List.of("ETH", "SOL")
            ));
        }
    }

    private User buildUser(String login, String rawPassword, String role, List<String> watchlist, List<String> favorites) {
        return User.builder()
                .login(login)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .watchlist(new ArrayList<>(watchlist))
                .favorites(new ArrayList<>(favorites))
                .createdAt(new Date())
                .build();
    }

    private void seedCoins() {
        Date now = new Date();

        seedCoinIfMissing("BTC", "Bitcoin", 1, now);
        seedCoinIfMissing("ETH", "Ethereum", 1027, now);
        seedCoinIfMissing("SOL", "Solana", 5426, now);
        seedCoinIfMissing("ADA", "Cardano", 2010, now);
        seedCoinIfMissing("DOGE", "Dogecoin", 74, now);
    }

    private void seedCoinIfMissing(String symbol, String name, int cmcId, Date updatedAt) {
        if (coinsMetaRepository.findBySymbol(symbol).isEmpty()) {
            coinsMetaRepository.save(buildCoin(symbol, name, cmcId, updatedAt));
        }
    }

    private CoinsMeta buildCoin(String symbol, String name, int cmcId, Date updatedAt) {
        return CoinsMeta.builder()
                .symbol(symbol)
                .name(name)
                .cmcId(cmcId)
                .lastUpdated(updatedAt)
                .build();
    }

    private void seedSnapshots() {
        if (coinSnapshotsRepository.count() > 0) {
            return;
        }

        Instant start = Instant.now().minus(SNAPSHOT_DAYS, ChronoUnit.DAYS);
        List<CoinProfile> profiles = List.of(
                new CoinProfile("BTC", 86000.0, 1.67e12, 4.20e10, 0.018, 0.00),
                new CoinProfile("ETH", 2500.0, 3.00e11, 2.10e10, 0.022, 0.70),
                new CoinProfile("SOL", 180.0, 9.20e10, 7.40e9, 0.028, 1.40),
                new CoinProfile("ADA", 0.68, 2.40e10, 1.10e9, 0.031, 2.10),
                new CoinProfile("DOGE", 0.16, 2.30e10, 1.40e9, 0.034, 2.80)
        );

        List<CoinSnapshot> snapshots = new ArrayList<>(profiles.size() * SNAPSHOTS_PER_COIN);

        for (CoinProfile profile : profiles) {
            for (int step = 0; step < SNAPSHOTS_PER_COIN; step++) {
                Instant timestamp = start.plus(step * SNAPSHOT_INTERVAL_MINUTES, ChronoUnit.MINUTES);
                double wave = Math.sin((step / 14.0) + profile.phase()) * profile.volatility();
                double trend = (step / (double) SNAPSHOTS_PER_COIN) * profile.trend();
                double price = Math.max(profile.basePrice() * (1.0 + wave + trend), profile.basePrice() * 0.2);
                double marketCap = Math.max(profile.baseMarketCap() * (1.0 + wave * 0.8 + trend * 0.9), 1.0);
                double volume24h = Math.max(profile.baseVolume24h() * (1.0 + Math.cos((step / 10.0) + profile.phase()) * 0.12), 1.0);
                double percentChange24h = (Math.sin((step / 18.0) + profile.phase()) * 4.0) + (trend * 100.0);

                snapshots.add(CoinSnapshot.builder()
                        .symbol(profile.symbol())
                        .timestamp(Date.from(timestamp))
                        .price(price)
                        .marketCap(marketCap)
                        .volume24h(volume24h)
                        .percentChange24h(percentChange24h)
                        .build());
            }
        }

        coinSnapshotsRepository.saveAll(snapshots);
        log.info("Seeded {} coin snapshots", snapshots.size());
    }

    private void seedStatisticsPreset() {
        User user = userRepository.findByLogin("user").orElse(null);
        if (user == null || user.getId() == null) {
            return;
        }

        if (statisticsPresetRepository.existsByUserIdAndName(user.getId(), "BTC vs ETH / week")) {
            return;
        }

        Instant now = Instant.now();
        StatisticsPreset preset = StatisticsPreset.builder()
                .userId(user.getId())
                .name("BTC vs ETH / week")
                .symbols(List.of("BTC", "ETH"))
                .timeRangeFrom(Date.from(now.minus(7, ChronoUnit.DAYS)))
                .timeRangeTo(Date.from(now))
                .minPrice(1000.0)
                .maxPrice(200000.0)
                .minVolume(1000000.0)
                .aggregation("days")
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        statisticsPresetRepository.save(preset);
    }

    private record CoinProfile(
            String symbol,
            double basePrice,
            double baseMarketCap,
            double baseVolume24h,
            double volatility,
            double phase
    ) {
        double trend() {
            return switch (symbol) {
                case "BTC" -> 0.045;
                case "ETH" -> 0.055;
                case "SOL" -> 0.065;
                case "ADA" -> 0.070;
                case "DOGE" -> 0.075;
                default -> 0.05;
            };
        }
    }
}



