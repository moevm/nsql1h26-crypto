package com.cryptowatch.backend.dto.cmc;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RefreshResult {
    private int refreshedCount;
    private List<String> symbols;
    private Date lastUpdatedAt;
    private boolean syncEnabled;
}