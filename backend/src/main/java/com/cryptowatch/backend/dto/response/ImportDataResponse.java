package com.cryptowatch.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportDataResponse {
    private boolean success;
    private String message;
    private Map<String, Long> recordCount;
    private Date importedAt;
}