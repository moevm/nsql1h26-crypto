package com.cryptowatch.backend.dto.common;

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
public class PresetDto {
    private String id;
    private String name;
    private List<String> symbols;
    private Date timeRangeFrom;
    private Date timeRangeTo;
    private Double minPrice;
    private Double maxPrice;
    private Double minVolume;
    private String aggregation;
    private Date createdAt;
    private Date updatedAt;
}