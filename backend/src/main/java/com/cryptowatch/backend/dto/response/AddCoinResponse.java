package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCoinResponse {
    private boolean success;
    private String message;
    private CoinInfo coin;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoinInfo {
        private String symbol;
        private String name;
    }
}