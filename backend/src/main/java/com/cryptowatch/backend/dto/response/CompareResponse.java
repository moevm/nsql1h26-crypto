package com.cryptowatch.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CompareResponse {

    private List<CoinData> coins;
    private List<String> insufficientData;

    @Data
    @Builder
    public static class CoinData {
        private String symbol;
        private String name;
        private List<LinearPoint> linearSeries;
        private BoxPlotStats boxPlot;
    }

    @Data
    @Builder
    public static class LinearPoint {
        private String timestamp;
        private double pctFromStart;
    }

    @Data
    @Builder
    public static class BoxPlotStats {
        private double min;
        private double q1;
        private double median;
        private double q3;
        private double max;
    }
}
