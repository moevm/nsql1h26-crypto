package com.cryptowatch.backend.controller;

import com.cryptowatch.backend.dto.*;
import com.cryptowatch.backend.security.JwtTokenProvider;
import com.cryptowatch.backend.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/presets")
    public ResponseEntity<PresetListResponse> getUserPresets(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        String userId = extractUserId(authHeader);
        PresetListResponse response = statisticsService.getUserPresets(userId, pageSize, pageNo, sortBy, order);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/presets")
    public ResponseEntity<SavePresetResponse> savePreset(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SavePresetRequest request) {
        String userId = extractUserId(authHeader);
        SavePresetResponse response = statisticsService.savePreset(userId, request);
        HttpStatus status = "create".equalsIgnoreCase(request.getMode()) ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(response);
    }

    @DeleteMapping("/presets/{presetId}")
    public ResponseEntity<DeletePresetResponse> deletePreset(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String presetId) {
        String userId = extractUserId(authHeader);
        DeletePresetResponse response = statisticsService.deletePreset(userId, presetId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/build")
    public ResponseEntity<BuildStatisticsResponse> buildStatistics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam List<String> symbols,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date timeRangeFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date timeRangeTo,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minVolume,
            @RequestParam(defaultValue = "days") String aggregation) {
        String userId = extractUserId(authHeader);
        BuildStatisticsResponse response = statisticsService.buildStatistics(
                userId, symbols, timeRangeFrom, timeRangeTo, minPrice, maxPrice, minVolume, aggregation);
        return ResponseEntity.ok(response);
    }

    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.extractUserId(token);
    }
}