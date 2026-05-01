package com.cryptowatch.backend.dto.cmc;

import lombok.Data;
import java.util.Map;

@Data
public class CmcResponse {
    private Map<String, CmcQuoteData> data;
}