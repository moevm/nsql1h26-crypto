package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.ExportDataResponse;
import com.cryptowatch.backend.dto.ImportDataResponse;
import com.cryptowatch.backend.model.*;
import com.cryptowatch.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository snapshotsRepository;
    private final StatisticsSettingsRepository settingsRepository;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    public ExportDataResponse exportAllData() {
        List<User> users = userRepository.findAll();
        List<CoinsMeta> coinsMeta = coinsMetaRepository.findAll();
        List<CoinSnapshot> snapshots = snapshotsRepository.findAll();
        List<StatisticsSettings> settings = settingsRepository.findAll();

        Map<String, List<?>> data = new HashMap<>();
        data.put("users", users);
        data.put("coins_meta", coinsMeta);
        data.put("coin_snapshots", snapshots);
        data.put("statistics_settings", settings);

        Map<String, Long> recordCount = new HashMap<>();
        recordCount.put("users", (long) users.size());
        recordCount.put("coins_meta", (long) coinsMeta.size());
        recordCount.put("coin_snapshots", (long) snapshots.size());
        recordCount.put("statistics_settings", (long) settings.size());

        return ExportDataResponse.builder()
                .success(true)
                .data(data)
                .exportedAt(new Date())
                .recordCount(recordCount)
                .build();
    }

    @Transactional
    public ImportDataResponse importData(MultipartFile file) {
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File too large, max 100 MB");
        }

        JsonNode root;
        try {
            String content = new String(file.getBytes());
            root = objectMapper.readTree(content);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON format: " + e.getMessage());
        }

        if (!root.has("data") || !root.get("data").isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing 'data' object");
        }
        JsonNode dataNode = root.get("data");

        mongoTemplate.dropCollection(User.class);
        mongoTemplate.dropCollection(CoinsMeta.class);
        mongoTemplate.dropCollection(CoinSnapshot.class);
        mongoTemplate.dropCollection(StatisticsSettings.class);

        Map<String, Long> recordCount = new HashMap<>();

        // Import users
        try {
            if (dataNode.has("users") && dataNode.get("users").isArray()) {
                List<User> users = new ArrayList<>();
                for (JsonNode node : dataNode.get("users")) {
                    User user = objectMapper.treeToValue(node, User.class);
                    users.add(user);
                }
                userRepository.saveAll(users);
                recordCount.put("users", (long) users.size());
            } else {
                recordCount.put("users", 0L);
            }
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user data: " + e.getMessage());
        }

        // Import coins_meta
        try {
            if (dataNode.has("coins_meta") && dataNode.get("coins_meta").isArray()) {
                List<CoinsMeta> metas = new ArrayList<>();
                for (JsonNode node : dataNode.get("coins_meta")) {
                    CoinsMeta meta = objectMapper.treeToValue(node, CoinsMeta.class);
                    metas.add(meta);
                }
                coinsMetaRepository.saveAll(metas);
                recordCount.put("coins_meta", (long) metas.size());
            } else {
                recordCount.put("coins_meta", 0L);
            }
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coins_meta data: " + e.getMessage());
        }

        // Import coin_snapshots
        try {
            if (dataNode.has("coin_snapshots") && dataNode.get("coin_snapshots").isArray()) {
                List<CoinSnapshot> snapshots = new ArrayList<>();
                for (JsonNode node : dataNode.get("coin_snapshots")) {
                    CoinSnapshot snapshot = objectMapper.treeToValue(node, CoinSnapshot.class);
                    snapshots.add(snapshot);
                }
                snapshotsRepository.saveAll(snapshots);
                recordCount.put("coin_snapshots", (long) snapshots.size());
            } else {
                recordCount.put("coin_snapshots", 0L);
            }
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coin_snapshots data: " + e.getMessage());
        }

        // Import statistics_settings
        try {
            if (dataNode.has("statistics_settings") && dataNode.get("statistics_settings").isArray()) {
                List<StatisticsSettings> settings = new ArrayList<>();
                for (JsonNode node : dataNode.get("statistics_settings")) {
                    StatisticsSettings setting = objectMapper.treeToValue(node, StatisticsSettings.class);
                    settings.add(setting);
                }
                settingsRepository.saveAll(settings);
                recordCount.put("statistics_settings", (long) settings.size());
            } else {
                recordCount.put("statistics_settings", 0L);
            }
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid statistics_settings data: " + e.getMessage());
        }

        return ImportDataResponse.builder()
                .success(true)
                .message("Data imported successfully")
                .recordCount(recordCount)
                .importedAt(new Date())
                .build();
    }
}