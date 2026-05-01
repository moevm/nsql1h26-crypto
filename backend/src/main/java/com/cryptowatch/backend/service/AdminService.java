package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.response.ExportDataResponse;
import com.cryptowatch.backend.dto.response.ImportDataResponse;
import com.cryptowatch.backend.model.*;
import com.cryptowatch.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
public class AdminService {

    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository snapshotsRepository;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    public ExportDataResponse exportAllData() {
        List<CoinsMeta> coinsMeta = coinsMetaRepository.findAll();
        List<CoinSnapshot> snapshots = snapshotsRepository.findAll();

        Map<String, List<?>> data = new HashMap<>();
        data.put("coins_meta", coinsMeta);
        data.put("coin_snapshots", snapshots);

        Map<String, Long> recordCount = new HashMap<>();
        recordCount.put("coins_meta", (long) coinsMeta.size());
        recordCount.put("coin_snapshots", (long) snapshots.size());

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

        if (!dataNode.has("coins_meta") || !dataNode.get("coins_meta").isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing or invalid 'coins_meta' array");
        }
        if (!dataNode.has("coin_snapshots") || !dataNode.get("coin_snapshots").isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing or invalid 'coin_snapshots' array");
        }
        
        List<CoinsMeta> newMetas = new ArrayList<>();
        List<CoinSnapshot> newSnapshots = new ArrayList<>();
        // Валидация coins_meta
        JsonNode metasNode = dataNode.get("coins_meta");
        for (JsonNode node : metasNode) {
            try {
                CoinsMeta meta = objectMapper.treeToValue(node, CoinsMeta.class);
                if (meta.getSymbol() == null || meta.getSymbol().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin meta has blank symbol");
                }
                if (meta.getName() == null || meta.getName().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin meta has blank name for symbol " + meta.getSymbol());
                }
                newMetas.add(meta);
            } catch (JsonProcessingException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coin_meta entry: " + e.getMessage());
            }
        }

        // Валидация coin_snapshots
        JsonNode snapshotsNode = dataNode.get("coin_snapshots");
        for (JsonNode node : snapshotsNode) {
            try {
                CoinSnapshot snapshot = objectMapper.treeToValue(node, CoinSnapshot.class);
                if (snapshot.getSymbol() == null || snapshot.getSymbol().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin snapshot has blank symbol");
                }
                if (snapshot.getTimestamp() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin snapshot has null timestamp for symbol " + snapshot.getSymbol());
                }
                newSnapshots.add(snapshot);
            } catch (JsonProcessingException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coin_snapshot entry: " + e.getMessage());
            }
        }

        log.info("Import validation passed, clearing existing market collections and inserting {} metas and {} snapshots",
                newMetas.size(), newSnapshots.size());

        mongoTemplate.dropCollection(CoinsMeta.class);
        mongoTemplate.dropCollection(CoinSnapshot.class);

        coinsMetaRepository.saveAll(newMetas);
        snapshotsRepository.saveAll(newSnapshots);

        Map<String, Long> recordCount = new HashMap<>();
        recordCount.put("coins_meta", (long) newMetas.size());
        recordCount.put("coin_snapshots", (long) newSnapshots.size());

        return ImportDataResponse.builder()
                .success(true)
                .message("Data imported successfully")
                .recordCount(recordCount)
                .importedAt(new Date())
                .build();
    }
}