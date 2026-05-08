package com.cryptowatch.backend.dto.cmc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CmcHistoricalResponse {
    private CmcHistoricalData data;
}