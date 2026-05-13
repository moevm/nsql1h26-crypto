package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.common.CoinDto;
import com.cryptowatch.backend.dto.response.AddCoinResponse;
import com.cryptowatch.backend.dto.response.DeleteCoinResponse;
import com.cryptowatch.backend.dto.response.WatchlistResponse;
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
    private final CoinMarketCapService coinMarketCapService;
    
    @Transactional(readOnly = true)
    public WatchlistResponse getWatchlist(String userId, int pageSize, int pageNo,
                                        Double priceMin, Double priceMax,
                                        Double capMin, Double capMax,
                                        Double changeMin, Double changeMax,
                                        Double volumeMin, Double volumeMax,
                                        String sortBy, String order,
                                        String query, Boolean onlyFavorites) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));

        List<String> InputWatchlist = user.getWatchlist();
        final List<String> watchlist = (InputWatchlist != null) ? InputWatchlist : new ArrayList<>();

        if (watchlist.isEmpty()) {
                return WatchlistResponse.builder()
                        .success(true)
                        .coins(List.of())
                        .totalCount(0)
                        .pageNo(pageNo)
                        .pageSize(pageSize)
                        .hasMore(false)
                        .updatedAt(new Date())
                        .build();
        }

        List<CoinsMeta> metas = coinsMetaRepository.findAll().stream()
                .filter(meta -> watchlist.contains(meta.getSymbol()))
                .collect(Collectors.toList());

        List<CoinSnapshot> latestSnapshots = coinSnapshotsRepository.findLatestSnapshotsForSymbols(watchlist);
        Map<String, CoinSnapshot> snapshotMap = latestSnapshots.stream()
                .collect(Collectors.toMap(CoinSnapshot::getSymbol, s -> s));

        List<CoinDto> filteredCoins = metas.stream()
                .map(meta -> {
                        CoinSnapshot snap = snapshotMap.get(meta.getSymbol());
                        if (snap == null) return null;
                        return CoinDto.builder()
                                .symbol(meta.getSymbol())
                                .name(meta.getName())
                                .price(snap.getPrice())
                                .percentChange24h(snap.getPercentChange24h())
                                .marketCap(snap.getMarketCap())
                                .volume24h(snap.getVolume24h())
                                .isFavorite(user.getFavorites() != null && user.getFavorites().contains(meta.getSymbol()))
                                .lastUpdated(snap.getTimestamp())
                                .build();
                })
                .filter(Objects::nonNull)
                .filter(coin -> query == null || query.isBlank() ||
                        coin.getSymbol().toLowerCase().contains(query.toLowerCase()) ||
                        coin.getName().toLowerCase().contains(query.toLowerCase()))
                .filter(coin -> !Boolean.TRUE.equals(onlyFavorites) || coin.isFavorite())
                .filter(coin -> applyFilters(coin, priceMin, priceMax, capMin, capMax, changeMin, changeMax, volumeMin, volumeMax))
                .collect(Collectors.toList());

        Comparator<CoinDto> comparator = getComparator(sortBy, order);
        filteredCoins.sort(comparator);

        long totalCount = filteredCoins.size();
        int start = pageNo * pageSize;
        int end = Math.min(start + pageSize, filteredCoins.size());
        List<CoinDto> pagedCoins = (start < filteredCoins.size()) ? filteredCoins.subList(start, end) : new ArrayList<>();
        boolean hasMore = end < totalCount;

        Date updatedAt = latestSnapshots.stream()
                .map(CoinSnapshot::getTimestamp)
                .max(Comparator.naturalOrder())
                .orElse(new Date());

        return WatchlistResponse.builder()
                .success(true)
                .coins(pagedCoins)
                .totalCount(totalCount)
                .pageNo(pageNo)
                .pageSize(pageSize)
                .hasMore(hasMore)
                .updatedAt(updatedAt)
                .build();
        }

   private boolean applyFilters(CoinDto coin, Double priceMin, Double priceMax,
                                Double capMin, Double capMax,
                                Double changeMin, Double changeMax,
                                Double volumeMin, Double volumeMax) {
        if (priceMin != null && coin.getPrice() < priceMin) return false;
        if (priceMax != null && coin.getPrice() > priceMax) return false;
        if (capMin != null && coin.getMarketCap() < capMin) return false;
        if (capMax != null && coin.getMarketCap() > capMax) return false;
        if (changeMin != null && coin.getPercentChange24h() < changeMin) return false;
        if (changeMax != null && coin.getPercentChange24h() > changeMax) return false;
        if (volumeMin != null && coin.getVolume24h() < volumeMin) return false;
        if (volumeMax != null && coin.getVolume24h() > volumeMax) return false;
        return true;
    }

    private Comparator<CoinDto> getComparator(String sortBy, String order) {
        Comparator<CoinDto> comparator;
        if ("price".equalsIgnoreCase(sortBy)) {
                comparator = Comparator.comparingDouble(CoinDto::getPrice);
        } else if ("percentChange24h".equalsIgnoreCase(sortBy)) {
                comparator = Comparator.comparingDouble(CoinDto::getPercentChange24h);
        } else {
                comparator = Comparator.comparingDouble(CoinDto::getMarketCap);
        }
        if ("desc".equalsIgnoreCase(order)) {
                comparator = comparator.reversed();
        }
        return comparator;
    }

    @Transactional
    public AddCoinResponse addToWatchlist(String userId, String initialSymbol) {
        if (initialSymbol == null || initialSymbol.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Символ обязателен");
        }

        final String symbol = initialSymbol.toUpperCase();

        CoinsMeta coinMeta = coinsMetaRepository.findBySymbol(symbol)
                .orElseGet(() -> coinMarketCapService.fetchAndCreateMetaIfAbsent(symbol));

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