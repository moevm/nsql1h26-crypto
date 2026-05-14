package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.cmc.*;
import com.cryptowatch.backend.config.CryptoConfig;
import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoinMarketCapService {

    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository snapshotsRepository;
    private final RestTemplate restTemplate;
    private final CryptoConfig cryptoConfig;
    private final ObjectMapper objectMapper;

    @Value("${CMC_API_KEY:}")
    private String apiKey;

    private static final String CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";


    public boolean isSyncEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }
    
    // Старый метод – для совместимости
    public RefreshResult refreshSnapshots(List<String> symbols) {
        CryptoConfig.History historyConfig = cryptoConfig.getHistory();
        return refreshSnapshots(symbols, historyConfig.getDefaultDays(), historyConfig.getDefaultInterval());
    }

    // Новый метод с параметрами истории
    public RefreshResult refreshSnapshots(List<String> symbols, int historyDays, String historyInterval) {
        if (!isSyncEnabled()) {
            log.warn("CMC_API_KEY not set – sync skipped");
            return new RefreshResult(0, new ArrayList<>(), new Date(), false);
        }

        List<CoinsMeta> metas = getMetas(symbols);
        if (metas.isEmpty()) {
            log.warn("No coins found for refresh");
            return new RefreshResult(0, new ArrayList<>(), new Date(), true);
        }

        String symbolParam = metas.stream().map(CoinsMeta::getSymbol).collect(Collectors.joining(","));
        String latestUrl = String.format("%s/quotes/latest?symbol=%s&convert=USD", CMC_URL, symbolParam);
        
        CmcResponse latestResponse = executeGet(latestUrl, CmcResponse.class);
        Date now = new Date();
        List<CoinSnapshot> allSnapshots = new ArrayList<>();
        List<String> refreshedSymbols = new ArrayList<>();

        for (CoinsMeta meta : metas) {
            try {
                CmcQuoteData quoteData = latestResponse.getData().get(meta.getSymbol());
                if (quoteData != null && quoteData.getQuote() != null) {
                    CmcUsd usd = quoteData.getQuote().get("USD");
                    if (usd != null) {
                        CoinSnapshot current = CoinSnapshot.builder()
                                .symbol(meta.getSymbol())
                                .timestamp(now)
                                .price(usd.getPrice())
                                .marketCap(usd.getMarketCap())
                                .volume24h(usd.getVolume24h())
                                .percentChange24h(usd.getPercentChange24h())
                                .build();
                        allSnapshots.add(current);
                        refreshedSymbols.add(meta.getSymbol());
                    }
                }

                List<CoinSnapshot> historical = fetchHistoricalSnapshots(meta.getSymbol(), historyDays, historyInterval);
                allSnapshots.addAll(historical);
            } catch (Exception e) {
                log.warn("Failed to process coin {}: {}", meta.getSymbol(), e.getMessage());
            }
        }

        if (!allSnapshots.isEmpty()) {
            snapshotsRepository.saveAll(allSnapshots);
            log.info("Saved {} total snapshots ({} current + historical)", allSnapshots.size(), refreshedSymbols.size());
        }

        return new RefreshResult(refreshedSymbols.size(), refreshedSymbols, now, true);
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

        Date now = new Date();
        CoinsMeta meta = CoinsMeta.builder()
                .symbol(upperSymbol)
                .name(info.getName())
                .cmcId(info.getId())
                .createdAt(now)
                .lastUpdated(now)
                .build();
        
        try {
            String quoteUrl = String.format("%s/quotes/latest?symbol=%s&convert=USD", CMC_URL, upperSymbol);
            CmcResponse quoteResponse = executeGet(quoteUrl, CmcResponse.class);
            if (quoteResponse != null && quoteResponse.getData() != null) {
                CmcQuoteData quoteData = quoteResponse.getData().get(upperSymbol);
                if (quoteData != null && quoteData.getQuote() != null) {
                    CmcUsd usd = quoteData.getQuote().get("USD");
                    if (usd != null) {
                        CoinSnapshot snapshot = CoinSnapshot.builder()
                                .symbol(upperSymbol)
                                .timestamp(new Date())
                                .price(usd.getPrice())
                                .marketCap(usd.getMarketCap())
                                .volume24h(usd.getVolume24h())
                                .percentChange24h(usd.getPercentChange24h())
                                .build();
                        snapshotsRepository.save(snapshot);
                        log.info("Initial snapshot created for {}: price={}", upperSymbol, usd.getPrice());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch initial snapshot for {}: {}", upperSymbol, e.getMessage());
        }
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
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            log.debug("CMC API request: {}", url);
            
            ResponseEntity<String> rawResponse = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String body = rawResponse.getBody();
            
            log.debug("CMC API response status: {}", rawResponse.getStatusCode());
            log.debug("CMC API response body (first 500 chars): {}", 
                    body != null ? body.substring(0, Math.min(500, body.length())) : "null");
            
            if (body == null || body.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Empty response from CMC");
            }
            
            // Десериализуем
            return objectMapper.readValue(body, responseType);
            
        } catch (com.fasterxml.jackson.databind.JsonMappingException e) {
            log.error("JSON deserialization error: {}", e.getMessage());
            log.error("Error details: {}", e.getOriginalMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to parse CMC response: " + e.getMessage());
        } catch (com.fasterxml.jackson.core.JsonParseException e) {
            log.error("JSON parse error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Invalid JSON from CMC: " + e.getMessage());
        } catch (RestClientException e) {
            log.error("CMC API request failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "CMC API error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during CMC API call", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error: " + e.getMessage());
        }
    }

    public List<CoinSnapshot> fetchHistoricalSnapshots(String symbol, int days, String interval) {
        if (!isSyncEnabled()) {
            log.debug("Sync disabled, skip historical fetch for {}", symbol);
            return List.of();
        }

        String upperSymbol = symbol.toUpperCase();
        Instant now = Instant.now();
        Instant start = now.minus(days, ChronoUnit.DAYS);
        DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_INSTANT;

        String url = String.format("%s/quotes/historical?symbol=%s&time_start=%s&time_end=%s&interval=%s&convert=USD",
                CMC_URL, upperSymbol,
                isoFormatter.format(start), isoFormatter.format(now),
                interval);

        try {
            CmcHistoricalResponse response = executeGet(url, CmcHistoricalResponse.class);
            if (response == null || response.getData() == null || response.getData().getQuotes() == null) {
                log.warn("No historical data for {} with interval {}", upperSymbol, interval);
                return List.of();
            }

            List<CoinSnapshot> newSnapshots = new ArrayList<>();
            for (CmcHistoricalQuote quote : response.getData().getQuotes()) {
                Date timestamp = Date.from(Instant.parse(quote.getTimestamp()));
                if (!snapshotsRepository.existsBySymbolAndTimestamp(upperSymbol, timestamp)) {
                    CoinSnapshot snapshot = CoinSnapshot.builder()
                            .symbol(upperSymbol)
                            .timestamp(timestamp)
                            .price(quote.getPrice())
                            .marketCap(quote.getMarketCap())
                            .volume24h(quote.getVolume24h())
                            .percentChange24h(quote.getPercentChange24h())
                            .build();
                    newSnapshots.add(snapshot);
                }
            }
            log.info("Fetched {} new historical snapshots for {}", newSnapshots.size(), upperSymbol);
            return newSnapshots;
        } catch (Exception e) {
            log.error("Failed to fetch historical data for {}: {}", upperSymbol, e.getMessage());
            return List.of();
        }
    }
}