package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.AddCoinResponse;
import com.cryptowatch.backend.dto.CoinDto;
import com.cryptowatch.backend.dto.DeleteCoinResponse;
import com.cryptowatch.backend.dto.WatchlistResponse;
import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.model.User;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.cryptowatch.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final UserRepository userRepository;
    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository coinSnapshotsRepository;

    @Transactional(readOnly = true)
    public WatchlistResponse getWatchlist(String userId, int pageSize, int pageNo) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));

        List<String> watchlist = user.getWatchlist();
        if (watchlist == null) watchlist = new ArrayList<>();

        long totalCount = watchlist.size();
        int start = pageNo * pageSize;
        int end = Math.min(start + pageSize, watchlist.size());
        List<String> pageSymbols = (start < watchlist.size()) ? watchlist.subList(start, end) : new ArrayList<>();

        List<CoinsMeta> metas = coinsMetaRepository.findAll().stream()
                .filter(meta -> pageSymbols.contains(meta.getSymbol()))
                .collect(Collectors.toList());

        List<CoinSnapshot> snapshots = coinSnapshotsRepository.findLatestSnapshotsForSymbols(pageSymbols);

        List<CoinDto> coins = metas.stream()
                .map(meta -> {
                    CoinSnapshot snapshot = snapshots.stream()
                            .filter(s -> s.getSymbol().equals(meta.getSymbol()))
                            .findFirst().orElse(null);
                    return CoinDto.builder()
                            .symbol(meta.getSymbol())
                            .name(meta.getName())
                            .price(snapshot != null ? snapshot.getPrice() : 0.0)
                            .percentChange24h(snapshot != null ? snapshot.getPercentChange24h() : 0.0)
                            .marketCap(snapshot != null ? snapshot.getMarketCap() : 0.0)
                            .volume24h(snapshot != null ? snapshot.getVolume24h() : 0.0)
                            .isFavorite(user.getFavorites() != null && user.getFavorites().contains(meta.getSymbol()))
                            .lastUpdated(meta.getLastUpdated())
                            .build();
                })
                .sorted(Comparator.comparingDouble(CoinDto::getMarketCap).reversed())
                .collect(Collectors.toList());

        boolean hasMore = end < watchlist.size();
        Date updatedAt = snapshots.stream()
                .map(CoinSnapshot::getTimestamp)
                .max(Comparator.naturalOrder())
                .orElse(new Date());

        return WatchlistResponse.builder()
                .success(true)
                .coins(coins)
                .totalCount(totalCount)
                .hasMore(hasMore)
                .updatedAt(updatedAt)
                .build();
    }

    @Transactional
    public AddCoinResponse addToWatchlist(String userId, String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Символ обязателен");
        }

        symbol = symbol.toUpperCase();

        CoinsMeta coinMeta = coinsMetaRepository.findBySymbol(symbol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Монета не найдена"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));

        List<String> watchlist = user.getWatchlist();
        if (watchlist == null) watchlist = new ArrayList<>();

        if (watchlist.contains(symbol)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Монета уже в списке наблюдения");
        }

        watchlist.add(symbol);
        user.setWatchlist(watchlist);
        userRepository.save(user);

        AddCoinResponse.CoinInfo coinInfo = AddCoinResponse.CoinInfo.builder()
                .symbol(coinMeta.getSymbol())
                .name(coinMeta.getName())
                .build();

        return AddCoinResponse.builder()
                .success(true)
                .message(symbol + " добавлена в список наблюдения")
                .coin(coinInfo)
                .build();
    }

    @Transactional
    public DeleteCoinResponse removeFromWatchlist(String userId, String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неверный символ");
        }

        symbol = symbol.toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));

        List<String> watchlist = user.getWatchlist();
        if (watchlist == null || !watchlist.contains(symbol)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Монета отсутствует в списке наблюдения");
        }

        watchlist.remove(symbol);
        user.setWatchlist(watchlist);
        userRepository.save(user);

        return DeleteCoinResponse.builder()
                .success(true)
                .message(symbol + " удалена из списка наблюдения")
                .build();
    }
}