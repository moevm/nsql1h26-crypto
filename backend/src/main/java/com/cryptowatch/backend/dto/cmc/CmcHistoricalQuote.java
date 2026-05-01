package com.cryptowatch.backend.dto.cmc;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class CmcHistoricalQuote {
    private String timestamp;
    private double price;
    @JsonProperty("volume_24h")
    private double volume24h;
    @JsonProperty("market_cap")
    private double marketCap;
    @JsonProperty("percent_change_24h")
    private double percentChange24h;
}