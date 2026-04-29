package com.cryptowatch.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "coin_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "symbol_timestamp_idx", def = "{'symbol': 1, 'timestamp': -1}")
public class CoinSnapshot {
    @Id
    private String id;

    private String symbol;
    private Date timestamp;
    private double price;
    private double marketCap;
    private double volume24h;
    private double percentChange24h;
}