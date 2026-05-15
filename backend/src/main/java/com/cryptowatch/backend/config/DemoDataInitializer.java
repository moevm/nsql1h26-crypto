package com.cryptowatch.backend.config;

import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.model.StatisticsPreset;
import com.cryptowatch.backend.model.User;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.cryptowatch.backend.repository.StatisticsPresetRepository;
import com.cryptowatch.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private static final String DATA_KEY = "data";

    private final UserRepository userRepository;
    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository coinSnapshotsRepository;
    private final StatisticsPresetRepository statisticsPresetRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.file:classpath:demo-data.json}")
    private String seedFilePath;

    @Override
    public void run(String... args) {
        DemoSeedData seedData = loadSeedData();

        if (isDatabaseEmpty()) {
            userRepository.saveAll(seedData.users());
            coinsMetaRepository.saveAll(seedData.coinsMeta());
            coinSnapshotsRepository.saveAll(seedData.coinSnapshots());
            statisticsPresetRepository.saveAll(seedData.statisticsPresets());

            log.info(
                    "Seed import completed from {}: users={}, coins_meta={}, coin_snapshots={}, statistics_presets={}",
                    seedFilePath,
                    seedData.users().size(),
                    seedData.coinsMeta().size(),
                    seedData.coinSnapshots().size(),
                    seedData.statisticsPresets().size()
            );
            return;
        }

        log.info("Seed merge started from {}", seedFilePath);
        mergeUsers(seedData.users());
        mergeCoinsMeta(seedData.coinsMeta());
        mergeCoinSnapshots(seedData.coinSnapshots());
        mergeStatisticsPresets(seedData.statisticsPresets());
        log.info("Seed merge completed from {}", seedFilePath);
    }

    private void mergeUsers(List<User> seedUsers) {
        if (seedUsers.isEmpty()) {
            log.info("Seed merge users skipped: no users in demo data");
            return;
        }

        Map<String, User> existingByLogin = new HashMap<>();
        for (User existing : userRepository.findAll()) {
            if (existing.getLogin() != null) {
                existingByLogin.put(existing.getLogin(), existing);
            }
        }

        List<User> toSave = new ArrayList<>(seedUsers.size());
        int inserted = 0;
        int updated = 0;

        for (User seed : seedUsers) {
            User existing = existingByLogin.get(seed.getLogin());
            User merged = mergeUser(seed, existing);
            toSave.add(merged);
            if (existing == null) {
                inserted++;
            } else {
                updated++;
            }
        }

        userRepository.saveAll(toSave);
        log.info("Seed merge users done: inserted={}, updated={}, totalSeed={}", inserted, updated, seedUsers.size());
    }

    private User mergeUser(User seed, User existing) {
        if (existing == null) {
            normalizeUserForAuth(seed);
            return seed;
        }

        User merged = new User();
        merged.setId(existing.getId());
        merged.setLogin(seed.getLogin() != null ? seed.getLogin() : existing.getLogin());
        merged.setPasswordHash(seed.getPasswordHash() != null ? seed.getPasswordHash() : existing.getPasswordHash());
        merged.setRole(seed.getRole() != null ? seed.getRole() : existing.getRole());
        merged.setWatchlist(seed.getWatchlist() != null ? seed.getWatchlist() : existing.getWatchlist());
        merged.setFavorites(seed.getFavorites() != null ? seed.getFavorites() : existing.getFavorites());
        merged.setCreatedAt(seed.getCreatedAt() != null ? seed.getCreatedAt() : existing.getCreatedAt());
        normalizeUserForAuth(merged);
        return merged;
    }

    private void mergeCoinsMeta(List<CoinsMeta> seedMetas) {
        if (seedMetas.isEmpty()) {
            log.info("Seed merge coins_meta skipped: no entries in demo data");
            return;
        }

        Map<String, CoinsMeta> existingBySymbol = new HashMap<>();
        for (CoinsMeta existing : coinsMetaRepository.findAll()) {
            if (existing.getSymbol() != null) {
                existingBySymbol.put(existing.getSymbol(), existing);
            }
        }

        List<CoinsMeta> toSave = new ArrayList<>(seedMetas.size());
        int inserted = 0;
        int updated = 0;

        for (CoinsMeta seed : seedMetas) {
            CoinsMeta existing = existingBySymbol.get(seed.getSymbol());
            CoinsMeta merged = mergeCoinsMeta(seed, existing);
            toSave.add(merged);
            if (existing == null) {
                inserted++;
            } else {
                updated++;
            }
        }

        coinsMetaRepository.saveAll(toSave);
        log.info("Seed merge coins_meta done: inserted={}, updated={}, totalSeed={}", inserted, updated, seedMetas.size());
    }

    private CoinsMeta mergeCoinsMeta(CoinsMeta seed, CoinsMeta existing) {
        if (existing == null) {
            return seed;
        }

        CoinsMeta merged = new CoinsMeta();
        merged.setId(existing.getId());
        merged.setSymbol(seed.getSymbol() != null ? seed.getSymbol() : existing.getSymbol());
        merged.setName(seed.getName() != null ? seed.getName() : existing.getName());

        int cmcId = seed.getCmcId();
        if (cmcId == 0 && existing.getCmcId() != 0) {
            cmcId = existing.getCmcId();
        }
        merged.setCmcId(cmcId);

        merged.setCreatedAt(seed.getCreatedAt() != null ? seed.getCreatedAt() : existing.getCreatedAt());
        merged.setLastUpdated(seed.getLastUpdated() != null ? seed.getLastUpdated() : existing.getLastUpdated());
        return merged;
    }

    private void mergeCoinSnapshots(List<CoinSnapshot> seedSnapshots) {
        if (seedSnapshots.isEmpty()) {
            log.info("Seed merge coin_snapshots skipped: no entries in demo data");
            return;
        }

        Map<String, CoinSnapshot> existingByKey = new HashMap<>();
        for (CoinSnapshot existing : coinSnapshotsRepository.findAll()) {
            String key = snapshotKey(existing);
            if (key != null) {
                existingByKey.put(key, existing);
            }
        }

        List<CoinSnapshot> toSave = new ArrayList<>(seedSnapshots.size());
        int inserted = 0;
        int updated = 0;

        for (CoinSnapshot seed : seedSnapshots) {
            CoinSnapshot existing = existingByKey.get(snapshotKey(seed));
            CoinSnapshot merged = mergeCoinSnapshot(seed, existing);
            toSave.add(merged);
            if (existing == null) {
                inserted++;
            } else {
                updated++;
            }
        }

        coinSnapshotsRepository.saveAll(toSave);
        log.info("Seed merge coin_snapshots done: inserted={}, updated={}, totalSeed={}", inserted, updated, seedSnapshots.size());
    }

    private String snapshotKey(CoinSnapshot snapshot) {
        if (snapshot == null || snapshot.getSymbol() == null || snapshot.getTimestamp() == null) {
            return null;
        }
        return snapshot.getSymbol() + "|" + snapshot.getTimestamp().getTime();
    }

    private CoinSnapshot mergeCoinSnapshot(CoinSnapshot seed, CoinSnapshot existing) {
        if (existing == null) {
            return seed;
        }

        CoinSnapshot merged = new CoinSnapshot();
        merged.setId(existing.getId());
        merged.setSymbol(seed.getSymbol() != null ? seed.getSymbol() : existing.getSymbol());
        merged.setTimestamp(seed.getTimestamp() != null ? seed.getTimestamp() : existing.getTimestamp());
        merged.setPrice(seed.getPrice());
        merged.setMarketCap(seed.getMarketCap());
        merged.setVolume24h(seed.getVolume24h());
        merged.setPercentChange24h(seed.getPercentChange24h());
        return merged;
    }

    private void mergeStatisticsPresets(List<StatisticsPreset> seedPresets) {
        if (seedPresets.isEmpty()) {
            log.info("Seed merge statistics_presets skipped: no entries in demo data");
            return;
        }

        Map<String, StatisticsPreset> existingByKey = new HashMap<>();
        for (StatisticsPreset existing : statisticsPresetRepository.findAll()) {
            String key = presetKey(existing);
            if (key != null) {
                existingByKey.put(key, existing);
            }
        }

        List<StatisticsPreset> toSave = new ArrayList<>(seedPresets.size());
        int inserted = 0;
        int updated = 0;

        for (StatisticsPreset seed : seedPresets) {
            StatisticsPreset existing = existingByKey.get(presetKey(seed));
            StatisticsPreset merged = mergeStatisticsPreset(seed, existing);
            toSave.add(merged);
            if (existing == null) {
                inserted++;
            } else {
                updated++;
            }
        }

        statisticsPresetRepository.saveAll(toSave);
        log.info("Seed merge statistics_presets done: inserted={}, updated={}, totalSeed={}", inserted, updated, seedPresets.size());
    }

    private String presetKey(StatisticsPreset preset) {
        if (preset == null || preset.getUserId() == null || preset.getName() == null) {
            return null;
        }
        return preset.getUserId() + "|" + preset.getName();
    }

    private StatisticsPreset mergeStatisticsPreset(StatisticsPreset seed, StatisticsPreset existing) {
        if (existing == null) {
            return seed;
        }

        StatisticsPreset merged = new StatisticsPreset();
        merged.setId(existing.getId());
        merged.setUserId(seed.getUserId() != null ? seed.getUserId() : existing.getUserId());
        merged.setName(seed.getName() != null ? seed.getName() : existing.getName());
        merged.setSymbols(seed.getSymbols() != null ? seed.getSymbols() : existing.getSymbols());
        merged.setTimeRangeFrom(seed.getTimeRangeFrom() != null ? seed.getTimeRangeFrom() : existing.getTimeRangeFrom());
        merged.setTimeRangeTo(seed.getTimeRangeTo() != null ? seed.getTimeRangeTo() : existing.getTimeRangeTo());
        merged.setMinPrice(seed.getMinPrice() != null ? seed.getMinPrice() : existing.getMinPrice());
        merged.setMaxPrice(seed.getMaxPrice() != null ? seed.getMaxPrice() : existing.getMaxPrice());
        merged.setMinVolume(seed.getMinVolume() != null ? seed.getMinVolume() : existing.getMinVolume());
        merged.setAggregation(seed.getAggregation() != null ? seed.getAggregation() : existing.getAggregation());
        merged.setCreatedAt(seed.getCreatedAt() != null ? seed.getCreatedAt() : existing.getCreatedAt());
        merged.setUpdatedAt(seed.getUpdatedAt() != null ? seed.getUpdatedAt() : existing.getUpdatedAt());
        return merged;
    }

    private boolean isDatabaseEmpty() {
        return userRepository.count() == 0
                && coinsMetaRepository.count() == 0
                && coinSnapshotsRepository.count() == 0
                && statisticsPresetRepository.count() == 0;
    }

    private DemoSeedData loadSeedData() {
        Resource resource = resourceLoader.getResource(seedFilePath);
        if (!resource.exists()) {
            throw new IllegalStateException("Seed file not found: " + seedFilePath);
        }

        try (var inputStream = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(inputStream);
            JsonNode dataNode = root.has(DATA_KEY) && root.get(DATA_KEY).isObject() ? root.get(DATA_KEY) : root;

            List<User> users = parseList(dataNode, "users", User.class);
            users.forEach(this::normalizeUserForAuth);

            List<CoinsMeta> coinsMeta = parseList(dataNode, "coins_meta", CoinsMeta.class);
            List<CoinSnapshot> snapshots = parseList(dataNode, "coin_snapshots", CoinSnapshot.class);
            List<StatisticsPreset> presets = parseList(dataNode, "statistics_presets", StatisticsPreset.class);

            return new DemoSeedData(users, coinsMeta, snapshots, presets);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to load seed data from " + seedFilePath, exception);
        }
    }

    private void normalizeUserForAuth(User user) {
        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("$2")) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        if (user.getWatchlist() == null) {
            user.setWatchlist(new ArrayList<>());
        }
        if (user.getFavorites() == null) {
            user.setFavorites(new ArrayList<>());
        }
    }

    private <T> List<T> parseList(JsonNode dataNode, String key, Class<T> targetClass) {
        JsonNode rawArray = dataNode.get(key);
        if (rawArray == null || !rawArray.isArray()) {
            return List.of();
        }

        List<T> result = new ArrayList<>(rawArray.size());
        for (JsonNode item : rawArray) {
            JsonNode normalized = normalizeMongoId(item);
            try {
                result.add(objectMapper.treeToValue(normalized, targetClass));
            } catch (Exception exception) {
                throw new IllegalStateException("Invalid entry in section '" + key + "'", exception);
            }
        }
        return result;
    }

    private JsonNode normalizeMongoId(JsonNode source) {
        if (!(source instanceof ObjectNode objectNode)) {
            return source;
        }
        if (!objectNode.has("id") && objectNode.has("_id")) {
            JsonNode idNode = objectNode.get("_id");
            if (idNode.isTextual()) {
                objectNode.put("id", idNode.asText());
            } else if (idNode.isObject() && idNode.has("$oid") && idNode.get("$oid").isTextual()) {
                objectNode.put("id", idNode.get("$oid").asText());
            }
        }
        return objectNode;
    }

    private record DemoSeedData(
            List<User> users,
            List<CoinsMeta> coinsMeta,
            List<CoinSnapshot> coinSnapshots,
            List<StatisticsPreset> statisticsPresets
    ) {
    }
}
