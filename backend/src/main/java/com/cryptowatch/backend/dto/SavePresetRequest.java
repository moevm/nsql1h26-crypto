package com.cryptowatch.backend.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class SavePresetRequest {
    private String name;
    private List<String> symbols;
    private Date timeRangeFrom;
    private Date timeRangeTo;
    private Double minPrice;
    private Double maxPrice;
    private Double minVolume;
    private String aggregation; // "hours", "days", "weeks"
    private String mode; // "create" or "update"
    private String presetId; // required for update
}