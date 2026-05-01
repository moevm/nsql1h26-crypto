package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildStatisticsResponse {
    private boolean success;
    private Map<String, List<AggregatedData>> data; // key = symbol
    private BuildParameters parameters;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AggregatedData {
        private Date periodStart;
        private Date periodEnd;
        private double avgPrice;
        private double avgVolume;
        private double minPrice;
        private double maxPrice;
        private long recordCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuildParameters {
        private List<String> symbols;
        private Date timeRangeFrom;
        private Date timeRangeTo;
        private Double minPrice;
        private Double maxPrice;
        private Double minVolume;
        private String aggregation;
    }
}