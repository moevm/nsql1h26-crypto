package com.cryptowatch.backend.dto;

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
public class ExportDataResponse {
    private boolean success;
    private Map<String, List<?>> data; // keys: users, coins_meta, coin_snapshots, statistics_settings
    private Date exportedAt;
    private Map<String, Long> recordCount;
}