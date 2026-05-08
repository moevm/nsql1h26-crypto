package com.cryptowatch.backend.dto.cmc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CmcHistoricalData {
    private String symbol;
    private List<CmcHistoricalQuote> quotes;
}