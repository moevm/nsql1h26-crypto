package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import com.cryptowatch.backend.dto.common.CoinDto;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoritesResponse {
    private boolean success;
    private List<CoinDto> coins;
    private long totalCount;
    private int pageSize;
    private int pageNo;
    private boolean hasMore;
}