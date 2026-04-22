package com.cryptowatch.backend.service;

import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoinMarketCapService {

    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository snapshotsRepository;
    private final RestTemplate restTemplate;  // вместо WebClient

    @Value("${CMC_API_KEY:}")
    private String apiKey;

    private static final String CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

    public boolean isSyncEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    public RefreshResult refreshSnapshots(List<String> symbols) {
        if (!isSyncEnabled()) {
            log.info("CMC_API_KEY is not set. Running in DB-only mode, sync skipped.");
            return new RefreshResult(0, new ArrayList<>(), new Date(), false);
        }

        List<CoinsMeta> metas = getMetas(symbols);
        if (metas.isEmpty()) {
            return new RefreshResult(0, new ArrayList<>(), new Date(), true);
        }

        String symbolParam = metas.stream()
                .map(CoinsMeta::getSymbol)
                .collect(Collectors.joining(","));

        String url = String.format("%s?symbol=%s&convert=USD", CMC_URL, symbolParam);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-CMC_PRO_API_KEY", apiKey);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        ResponseEntity<CmcResponse> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                CmcResponse.class
        );
        CmcResponse response = responseEntity.getBody();

        if (response == null || response.getData() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Empty response from CMC");
        }

        Date now = new Date();
        List<CoinSnapshot> snapshots = new ArrayList<>();
        List<String> refreshedSymbols = new ArrayList<>();

        for (CoinsMeta meta : metas) {
            CmcQuoteData quoteData = response.getData().get(meta.getSymbol());
            if (quoteData != null && quoteData.getQuote() != null) {
                CmcUsd usd = quoteData.getQuote().get("USD");
                if (usd != null) {
                    CoinSnapshot snapshot = CoinSnapshot.builder()
                            .symbol(meta.getSymbol())
                            .timestamp(now)
                            .price(usd.getPrice())
                            .marketCap(usd.getMarketCap())
                            .volume24h(usd.getVolume24h())
                            .percentChange24h(usd.getPercentChange24h())
                            .build();
                    snapshots.add(snapshot);
                    refreshedSymbols.add(meta.getSymbol());
                }
            }
        }

        if (!snapshots.isEmpty()) {
            snapshotsRepository.saveAll(snapshots);
            log.info("Saved {} snapshots", snapshots.size());
        }

        return new RefreshResult(snapshots.size(), refreshedSymbols, now, true);

    }

    private List<CoinsMeta> getMetas(List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            return coinsMetaRepository.findAll();
        }
        return symbols.stream()
                .map(String::toUpperCase)
                .map(sym -> coinsMetaRepository.findBySymbol(sym).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @lombok.Data
    public static class CmcResponse {
        private Map<String, CmcQuoteData> data;
    }

    @lombok.Data
    public static class CmcQuoteData {
        private Map<String, CmcUsd> quote;
    }

    @lombok.Data
    public static class CmcUsd {
        private double price;
        @JsonProperty("volume_24h")
        private double volume24h;
        @JsonProperty("market_cap")
        private double marketCap;
        @JsonProperty("percent_change_24h")
        private double percentChange24h;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class RefreshResult {
        private int refreshedCount;
        private List<String> symbols;
        private Date lastUpdatedAt;
        private boolean syncEnabled;
    }
}
