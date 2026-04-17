package com.cryptowatch.backend.controller;

import com.cryptowatch.backend.dto.AddCoinResponse;
import com.cryptowatch.backend.dto.DeleteCoinResponse;
import com.cryptowatch.backend.dto.WatchlistResponse;
import com.cryptowatch.backend.security.JwtTokenProvider;
import com.cryptowatch.backend.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinsController {

    private final WatchlistService watchlistService;
    private final JwtTokenProvider jwtTokenProvider;

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
}