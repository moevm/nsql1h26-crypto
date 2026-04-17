package com.cryptowatch.backend.controller;

import com.cryptowatch.backend.dto.*;
import com.cryptowatch.backend.security.JwtTokenProvider;
import com.cryptowatch.backend.service.CoinService;
import com.cryptowatch.backend.service.WatchlistService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinsController {

    private final WatchlistService watchlistService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CoinService coinService;

    @GetMapping("/watchlist")
    public ResponseEntity<?> getWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int pageNo) {
        try {
            String token = authHeader.substring(7);
            String userId = jwtTokenProvider.extractUserId(token);
            WatchlistResponse response = watchlistService.getWatchlist(userId, pageSize, pageNo);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(WatchlistResponse.builder()
                            .success(false)
                            .coins(null)
                            .totalCount(0)
                            .hasMore(false)
                            .build());
        }
    }

    @PostMapping("/watchlist")
    public ResponseEntity<AddCoinResponse> addToWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AddToWatchlistRequest request) {
        try {
            String token = authHeader.substring(7);
            String userId = jwtTokenProvider.extractUserId(token);
            AddCoinResponse response = watchlistService.addToWatchlist(userId, request.getSymbol());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(AddCoinResponse.builder()
                            .success(false)
                            .message(e.getReason())
                            .build());
        }
    }

    @DeleteMapping("/watchlist/{symbol}")
    public ResponseEntity<DeleteCoinResponse> removeFromWatchlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String symbol) {
        try {
            String token = authHeader.substring(7);
            String userId = jwtTokenProvider.extractUserId(token);
            DeleteCoinResponse response = watchlistService.removeFromWatchlist(userId, symbol);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(DeleteCoinResponse.builder()
                            .success(false)
                            .message(e.getReason())
                            .build());
        }
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
}