package com.cryptowatch.backend.dto;

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
public class WatchlistResponse {
    private boolean success;
    private List<CoinDto> coins;
    private long totalCount;
    private boolean hasMore;
    private Date updatedAt;
}