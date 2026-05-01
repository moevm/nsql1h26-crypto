package com.cryptowatch.backend.dto.cmc;

import lombok.Data;
import java.util.List;

@Data
public class CmcHistoricalData {
    private String symbol;
    private List<CmcHistoricalQuote> quotes;
}