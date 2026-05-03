package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

import com.cryptowatch.backend.dto.common.CoinDto;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponse {
    private boolean success;
    private List<CoinDto> coins;
    private long totalCount;
    private boolean hasMore;
    private int pageNo;
    private int pageSize;
    private Date updatedAt;
}