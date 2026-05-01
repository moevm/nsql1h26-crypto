package com.cryptowatch.backend.controller;

import com.cryptowatch.backend.config.CryptoConfig;
import com.cryptowatch.backend.dto.response.*;
import com.cryptowatch.backend.dto.cmc.RefreshResult;
import com.cryptowatch.backend.security.JwtTokenProvider;
import com.cryptowatch.backend.service.CoinService;
import com.cryptowatch.backend.service.WatchlistService;
import com.cryptowatch.backend.service.CoinMarketCapService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinsController {

    private final WatchlistService watchlistService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CoinService coinService;
    private final CoinMarketCapService coinMarketCapService;
    private final CryptoConfig cryptoConfig;

    @GetMapping("/watchlist")
    public ResponseEntity<?> getWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo) {
        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        WatchlistResponse response = watchlistService.getWatchlist(userId, pageSize, pageNo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/watchlist")
    public ResponseEntity<AddCoinResponse> addToWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AddToWatchlistRequest request) {
        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        AddCoinResponse response = watchlistService.addToWatchlist(userId, request.getSymbol());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/watchlist/{symbol}")
    public ResponseEntity<DeleteCoinResponse> removeFromWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String symbol) {
        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        DeleteCoinResponse response = watchlistService.removeFromWatchlist(userId, symbol);
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    static class AddToWatchlistRequest {
        private String symbol;
    }

    @GetMapping("/search")
    public ResponseEntity<SearchCoinsResponse> searchCoins(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) Double capMin,
            @RequestParam(required = false) Double capMax,
            @RequestParam(required = false) Double changeMin,
            @RequestParam(required = false) Double changeMax,
            @RequestParam(required = false) Double volumeMin,
            @RequestParam(required = false) Double volumeMax,
            @RequestParam(defaultValue = "marketCap") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo) {

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        SearchCoinsResponse response = coinService.searchCoins(
                userId, query, priceMin, priceMax, capMin, capMax,
                changeMin, changeMax, volumeMin, volumeMax,
                sortBy, order, pageSize, pageNo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<CoinDetailsResponse> getCoinDetails(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String symbol) {
        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        CoinDetailsResponse response = coinService.getCoinDetails(userId, symbol);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<CoinHistoryResponse> getCoinHistory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String symbol,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date dateTo,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) Double volumeMin,
            @RequestParam(required = false) Double volumeMax,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo) {

        String token = authHeader.substring(7);
        jwtTokenProvider.extractUserId(token); // just validate

        CoinHistoryResponse response = coinService.getCoinHistory(
                symbol, dateFrom, dateTo, priceMin, priceMax, volumeMin, volumeMax,
                sortBy, order, pageSize, pageNo);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/favorites")
    public ResponseEntity<FavoritesResponse> getFavorites(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "marketCap") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) Double capMin,
            @RequestParam(required = false) Double capMax,
            @RequestParam(required = false) Double changeMin,
            @RequestParam(required = false) Double changeMax,
            @RequestParam(required = false) Double volumeMin,
            @RequestParam(required = false) Double volumeMax) {

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        FavoritesResponse response = coinService.getFavorites(
                userId, pageSize, pageNo, sortBy, order,
                priceMin, priceMax, capMin, capMax,
                changeMin, changeMax, volumeMin, volumeMax);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/favorites")
    public ResponseEntity<AddCoinResponse> addToFavorites(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AddToFavoritesRequest request) {

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        AddCoinResponse response = coinService.addToFavorites(userId, request.getSymbol());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/favorites/{symbol}")
    public ResponseEntity<DeleteCoinResponse> removeFromFavorites(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String symbol) {

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);
        DeleteCoinResponse response = coinService.removeFromFavorites(userId, symbol);
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    static class AddToFavoritesRequest {
        private String symbol;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshSnapshots(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) RefreshRequest request) {

        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.extractUserId(token);

        List<String> symbols = (request != null && request.getSymbols() != null) ? request.getSymbols() : null;
        Integer days = (request != null && request.getDays() != null) ? request.getDays() : null;
        String interval = (request != null && request.getInterval() != null) ? request.getInterval() : null;

        CryptoConfig.History historyConfig = cryptoConfig.getHistory(); // внедрить CryptoConfig в контроллер
        int actualDays = (days != null && days > 0) ? days : historyConfig.getDefaultDays();
        String actualInterval = (interval != null && !interval.isBlank()) ? interval : historyConfig.getDefaultInterval();

        RefreshResult result = coinMarketCapService.refreshSnapshots(symbols, actualDays, actualInterval);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Snapshots refreshed with history");
        response.put("refreshedCount", result.getRefreshedCount());
        response.put("symbols", result.getSymbols());
        response.put("lastUpdatedAt", result.getLastUpdatedAt());
        response.put("historyDays", actualDays);
        response.put("historyInterval", actualInterval);
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    static class RefreshRequest {
        private List<String> symbols;
        private Integer days;     
        private String interval;    
    }
}
