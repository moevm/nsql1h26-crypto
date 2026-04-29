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
import org.springframework.web.client.RestClientException;
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
    private final RestTemplate restTemplate;

    @Value("${CMC_API_KEY:}")
    private String apiKey;

    private static final String CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";


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

        String url = String.format("%s/quotes/latest?symbol=%s&convert=USD", CMC_URL, symbolParam);
        CmcResponse response = executeGet(url, CmcResponse.class);

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
    public CoinsMeta fetchAndCreateMetaIfAbsent(String symbol) {
        if (!isSyncEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "CMC_API_KEY is not set. Unable to fetch coin info.");
        }

        String upperSymbol = symbol.toUpperCase();

        Optional<CoinsMeta> existing = coinsMetaRepository.findBySymbol(upperSymbol);
        if (existing.isPresent()) {
            return existing.get();
        }

        String url = String.format("%s/info?symbol=%s", CMC_URL, upperSymbol);
        CmcInfoResponse infoResponse = executeGet(url, CmcInfoResponse.class);

        if (infoResponse == null || infoResponse.getData() == null || infoResponse.getData().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Symbol not found: " + upperSymbol);
        }

        CmcInfo info = infoResponse.getData().get(upperSymbol);
        if (info == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Symbol not found: " + upperSymbol);
        }

        CoinsMeta meta = CoinsMeta.builder()
                .symbol(upperSymbol)
                .name(info.getName())
                .cmcId(info.getId())
                .lastUpdated(new Date())
                .build();

        return coinsMetaRepository.save(meta);
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
    private <T> T executeGet(String url, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-CMC_PRO_API_KEY", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, entity, responseType);
            T body = response.getBody();
            if (body == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Empty response from CMC for URL: " + url);
            }
            return body;
        } catch (RestClientException e) {
            log.error("CMC API request failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "CMC API error: " + e.getMessage());
        }
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
    public static class CmcInfoResponse {
        private Map<String, CmcInfo> data;
    }

    @lombok.Data
    public static class CmcInfo {
        private int id;
        private String name;
        private String symbol;
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