package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.*;
import com.cryptowatch.backend.model.StatisticsPreset;
import com.cryptowatch.backend.repository.StatisticsPresetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsPresetRepository presetRepository;
    private final MongoTemplate mongoTemplate;

    public PresetListResponse getUserPresets(String userId, int pageSize, int pageNo, String sortBy, String order) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, 
                Sort.by(Sort.Direction.fromString(order), getSortField(sortBy)));
        List<StatisticsPreset> presets = presetRepository.findByUserId(userId, pageable);
        long totalCount = presetRepository.countByUserId(userId);
        boolean hasMore = (pageNo + 1) * pageSize < totalCount;
        
        List<PresetDto> presetDtos = presets.stream().map(this::toDto).collect(Collectors.toList());
        
        return PresetListResponse.builder()
                .success(true)
                .presets(presetDtos)
                .totalCount(totalCount)
                .pageSize(pageSize)
                .pageNo(pageNo)
                .hasMore(hasMore)
                .build();
    }
    
    @Transactional
    public SavePresetResponse savePreset(String userId, SavePresetRequest request) {
        if ("update".equalsIgnoreCase(request.getMode())) {
            if (request.getPresetId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "presetId required for update");
            }
            StatisticsPreset existing = presetRepository.findByIdAndUserId(request.getPresetId(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preset not found"));
            
            // If name changed, check uniqueness
            if (!existing.getName().equals(request.getName()) && 
                presetRepository.existsByUserIdAndName(userId, request.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preset name already exists");
            }
            
            existing.setName(request.getName());
            existing.setSymbols(request.getSymbols());
            existing.setTimeRangeFrom(request.getTimeRangeFrom());
            existing.setTimeRangeTo(request.getTimeRangeTo());
            existing.setMinPrice(request.getMinPrice());
            existing.setMaxPrice(request.getMaxPrice());
            existing.setMinVolume(request.getMinVolume());
            existing.setAggregation(request.getAggregation());
            existing.setUpdatedAt(new Date());
            StatisticsPreset saved = presetRepository.save(existing);
            return SavePresetResponse.builder()
                    .success(true)
                    .message("Preset updated successfully")
                    .presetId(saved.getId())
                    .preset(toDto(saved))
                    .build();
        } else {
            if (presetRepository.existsByUserIdAndName(userId, request.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preset name already exists");
            }
            StatisticsPreset preset = StatisticsPreset.builder()
                    .userId(userId)
                    .name(request.getName())
                    .symbols(request.getSymbols())
                    .timeRangeFrom(request.getTimeRangeFrom())
                    .timeRangeTo(request.getTimeRangeTo())
                    .minPrice(request.getMinPrice())
                    .maxPrice(request.getMaxPrice())
                    .minVolume(request.getMinVolume())
                    .aggregation(request.getAggregation())
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();
            StatisticsPreset saved = presetRepository.save(preset);
            return SavePresetResponse.builder()
                    .success(true)
                    .message("Preset created successfully")
                    .presetId(saved.getId())
                    .preset(toDto(saved))
                    .build();
        }
    }
    
    @Transactional
    public DeletePresetResponse deletePreset(String userId, String presetId) {
        StatisticsPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preset not found"));
        presetRepository.delete(preset);
        return DeletePresetResponse.builder()
                .success(true)
                .message("Preset deleted successfully")
                .build();
    }
    
    public BuildStatisticsResponse buildStatistics(String userId, List<String> symbols,
                                                   Date timeRangeFrom, Date timeRangeTo,
                                                   Double minPrice, Double maxPrice,
                                                   Double minVolume, String aggregation) {
        if (symbols == null || symbols.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one symbol required");
        }
        
        Date from = timeRangeFrom != null ? timeRangeFrom : Date.from(Instant.now().minus(30, ChronoUnit.DAYS));
        Date to = timeRangeTo != null ? timeRangeTo : new Date();
        
        Map<String, List<BuildStatisticsResponse.AggregatedData>> resultMap = new HashMap<>();
        
        for (String symbol : symbols) {
            List<BuildStatisticsResponse.AggregatedData> aggregated = aggregateForSymbol(
                    symbol, from, to, minPrice, maxPrice, minVolume, aggregation);
            resultMap.put(symbol, aggregated);
        }
        
        BuildStatisticsResponse.BuildParameters params = BuildStatisticsResponse.BuildParameters.builder()
                .symbols(symbols)
                .timeRangeFrom(from)
                .timeRangeTo(to)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minVolume(minVolume)
                .aggregation(aggregation)
                .build();
        
        return BuildStatisticsResponse.builder()
                .success(true)
                .data(resultMap)
                .parameters(params)
                .build();
    }
    
    private List<BuildStatisticsResponse.AggregatedData> aggregateForSymbol(String symbol,
                                                                            Date from, Date to,
                                                                            Double minPrice, Double maxPrice,
                                                                            Double minVolume,
                                                                            String aggregation) {
        Criteria criteria = Criteria.where("symbol").is(symbol)
                .and("timestamp").gte(from).lte(to);
        if (minPrice != null) criteria.and("price").gte(minPrice);
        if (maxPrice != null) criteria.and("price").lte(maxPrice);
        if (minVolume != null) criteria.and("volume24h").gte(minVolume);
        
        String dateGroupFormat;
        switch (aggregation.toLowerCase()) {
            case "hours":
                dateGroupFormat = "%Y-%m-%dT%H:00:00";
                break;
            case "weeks":
                dateGroupFormat = "%Y-%U";
                break;
            case "days":
            default:
                dateGroupFormat = "%Y-%m-%d";
                break;
        }
        
        Aggregation aggregationPipeline = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.project()
                        .andExpression("toDate(timestamp)").as("dateObj")
                        .and("price").as("price")
                        .and("volume24h").as("volume24h"),
                Aggregation.group(projectDateGrouping(dateGroupFormat))
                        .avg("price").as("avgPrice")
                        .avg("volume24h").as("avgVolume")
                        .min("price").as("minPrice")
                        .max("price").as("maxPrice")
                        .count().as("recordCount")
                        .first("dateObj").as("periodStart")
                        .last("dateObj").as("periodEnd"),
                Aggregation.sort(Sort.by(Sort.Direction.ASC, "_id"))
        );
        
        AggregationResults<AggregationResult> results = mongoTemplate.aggregate(
                aggregationPipeline, "coin_snapshots", AggregationResult.class);
        
        List<BuildStatisticsResponse.AggregatedData> list = new ArrayList<>();
        for (AggregationResult res : results.getMappedResults()) {
            list.add(BuildStatisticsResponse.AggregatedData.builder()
                    .periodStart(res.periodStart)
                    .periodEnd(res.periodEnd)
                    .avgPrice(res.avgPrice)
                    .avgVolume(res.avgVolume)
                    .minPrice(res.minPrice)
                    .maxPrice(res.maxPrice)
                    .recordCount(res.recordCount)
                    .build());
        }
        return list;
    }
    
    // Helper to create group by expression
    private String projectDateGrouping(String format) {
        return "{\n" +
                "    $dateToString: { format: \"" + format + "\", date: \"$timestamp\" }\n" +
                "}";
    }
    
    private static class AggregationResult {
        public String _id;
        public Date periodStart;
        public Date periodEnd;
        public double avgPrice;
        public double avgVolume;
        public double minPrice;
        public double maxPrice;
        public long recordCount;
    }
    
    private String getSortField(String sortBy) {
        if ("name".equals(sortBy)) return "name";
        if ("createdAt".equals(sortBy)) return "createdAt";
        return "updatedAt";
    }
    
    private PresetDto toDto(StatisticsPreset preset) {
        return PresetDto.builder()
                .id(preset.getId())
                .name(preset.getName())
                .symbols(preset.getSymbols())
                .timeRangeFrom(preset.getTimeRangeFrom())
                .timeRangeTo(preset.getTimeRangeTo())
                .minPrice(preset.getMinPrice())
                .maxPrice(preset.getMaxPrice())
                .minVolume(preset.getMinVolume())
                .aggregation(preset.getAggregation())
                .createdAt(preset.getCreatedAt())
                .updatedAt(preset.getUpdatedAt())
                .build();
    }
}