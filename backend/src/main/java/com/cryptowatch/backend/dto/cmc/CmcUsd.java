package com.cryptowatch.backend.dto.cmc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CmcUsd {
    private double price;
    @JsonProperty("volume_24h")
    private double volume24h;
    @JsonProperty("market_cap")
    private double marketCap;
    @JsonProperty("percent_change_24h")
    private double percentChange24h;
}