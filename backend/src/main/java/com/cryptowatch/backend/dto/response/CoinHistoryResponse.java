package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoinHistoryResponse {
    private boolean success;
    private String symbol;
    private List<HistoryEntry> history;
    private long totalCount;
    private DateRange dateRange;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryEntry {
        private Date timestamp;
        private double price;
        private double marketCap;
        private double volume24h;
        private double percentChange24h;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateRange {
        private Date from;
        private Date to;
    }
}