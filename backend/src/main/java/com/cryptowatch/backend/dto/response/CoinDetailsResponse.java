package com.cryptowatch.backend.dto.response;

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
public class CoinDetailsResponse {
    private boolean success;
    private String symbol;
    private String name;
    private double price;
    private double percentChange24h;
    private double marketCap;
    private double volume24h;
    private Double minPrice7d;
    private Double maxPrice7d;
    private Double avgPrice7d;
    @JsonProperty("isFavorite")
    private boolean isFavorite;
    private Date lastUpdated;
}
