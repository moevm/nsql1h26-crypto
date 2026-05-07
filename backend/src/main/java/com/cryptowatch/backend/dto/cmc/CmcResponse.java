package com.cryptowatch.backend.dto.cmc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CmcResponse {
    private Map<String, CmcQuoteData> data;
}