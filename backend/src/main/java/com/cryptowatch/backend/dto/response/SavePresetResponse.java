package com.cryptowatch.backend.dto.response;

import com.cryptowatch.backend.dto.common.PresetDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavePresetResponse {
    private boolean success;
    private String message;
    private String presetId;
    private PresetDto preset;
}