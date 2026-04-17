package com.cryptowatch.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresetListResponse {
    private boolean success;
    private List<PresetDto> presets;
    private long totalCount;
    private int pageSize;
    private int pageNo;
    private boolean hasMore;
}