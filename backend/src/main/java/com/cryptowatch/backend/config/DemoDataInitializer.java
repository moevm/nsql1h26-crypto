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
import java.util.List;

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

    @Value("${app.seed.force:false}")
    private boolean seedForce;

    @Override
    public void run(String... args) {
        if (!seedForce && !isDatabaseEmpty()) {
            log.info("Skip seed import: database is not empty");
            return;
        }

        if (seedForce && !isDatabaseEmpty()) {
            log.info("Force seed import: overwriting existing data from {}", seedFilePath);
        }

        DemoSeedData seedData = loadSeedData();

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
