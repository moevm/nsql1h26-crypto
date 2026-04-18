package com.cryptowatch.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchCoinsResponse {
    private boolean success;
    private List<CoinDto> coins;
    private long totalCount;
    private int pageSize;
    private int pageNo;
    private boolean hasMore;
    private Map<String, Object> appliedFilters;
}