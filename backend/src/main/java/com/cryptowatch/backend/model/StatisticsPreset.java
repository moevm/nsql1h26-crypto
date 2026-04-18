package com.cryptowatch.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "statistics_presets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsPreset {
    @Id
    private String id;
    
    private String userId;
    
    @Indexed
    private String name; // unique per user
    
    private List<String> symbols;
    private Date timeRangeFrom;
    private Date timeRangeTo;
    private Double minPrice;
    private Double maxPrice;
    private Double minVolume;
    private String aggregation; // "hours", "days", "weeks"
    private Date createdAt;
    private Date updatedAt;
}