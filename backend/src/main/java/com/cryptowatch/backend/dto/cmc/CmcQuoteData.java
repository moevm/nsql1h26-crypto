package com.cryptowatch.backend.dto.cmc;

import lombok.Data;
import java.util.Map;

@Data
public class CmcQuoteData {
    private Map<String, CmcUsd> quote;
}