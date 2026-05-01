package com.cryptowatch.backend.dto.cmc;

import lombok.Data;
import java.util.Map
;
@Data
public class CmcInfoResponse {
    private Map<String, CmcInfo> data;
}