package com.cryptowatch.backend.dto.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoinDto {
    private String symbol;
    private String name;
    private double price;
    private double percentChange24h;
    private double marketCap;
    private double volume24h;
    @JsonProperty("isFavorite")
    private boolean isFavorite;
    private Date lastUpdated;
}
