package com.cryptowatch.backend.service;

import com.cryptowatch.backend.dto.*;
import com.cryptowatch.backend.model.CoinSnapshot;
import com.cryptowatch.backend.model.CoinsMeta;
import com.cryptowatch.backend.model.User;
import com.cryptowatch.backend.repository.CoinSnapshotsRepository;
import com.cryptowatch.backend.repository.CoinsMetaRepository;
import com.cryptowatch.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoinService {

    private final CoinsMetaRepository coinsMetaRepository;
    private final CoinSnapshotsRepository snapshotsRepository;
    private final UserRepository userRepository;

    public SearchCoinsResponse searchCoins(String userId, String query,
                                           Double priceMin, Double priceMax,
                                           Double capMin, Double capMax,
                                           Double changeMin, Double changeMax,
                                           Double volumeMin, Double volumeMax,
                                           String sortBy, String order,
                                           int pageSize, int pageNo) {
        List<CoinsMeta> allMetas;
        if (query == null || query.isBlank()) {
            allMetas = coinsMetaRepository.findAll();
        } else {
            allMetas = coinsMetaRepository.searchBySymbolOrName(query);
        }
        
        List<String> symbols = allMetas.stream().map(CoinsMeta::getSymbol).collect(Collectors.toList());
        List<CoinSnapshot> latestSnapshots = snapshotsRepository.findLatestSnapshotsForSymbols(symbols);
        Map<String, CoinSnapshot> snapshotMap = latestSnapshots.stream()
                .collect(Collectors.toMap(CoinSnapshot::getSymbol, s -> s));
        
        User user = userRepository.findById(userId).orElse(null);
        List<String> favorites = (user != null && user.getFavorites() != null) ? user.getFavorites() : new ArrayList<>();
        
        List<CoinDto> filteredCoins = allMetas.stream()
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
                            .isFavorite(favorites.contains(meta.getSymbol()))
                            .lastUpdated(snap.getTimestamp())
                            .build();
                })
                .filter(Objects::nonNull)
                .filter(coin -> applyFilters(coin, priceMin, priceMax, capMin, capMax, changeMin, changeMax, volumeMin, volumeMax))
                .collect(Collectors.toList());
        
        Comparator<CoinDto> comparator = getComparator(sortBy, order);
        filteredCoins.sort(comparator);
        
        long totalCount = filteredCoins.size();
        int start = pageNo * pageSize;
        int end = Math.min(start + pageSize, filteredCoins.size());
        List<CoinDto> pagedCoins = (start < filteredCoins.size()) ? filteredCoins.subList(start, end) : new ArrayList<>();
        boolean hasMore = end < totalCount;
        
        Map<String, Object> appliedFilters = new HashMap<>();
        if (query != null && !query.isBlank()) appliedFilters.put("query", query);
        if (priceMin != null) appliedFilters.put("priceMin", priceMin);
        if (priceMax != null) appliedFilters.put("priceMax", priceMax);
        if (capMin != null) appliedFilters.put("capMin", capMin);
        if (capMax != null) appliedFilters.put("capMax", capMax);
        if (changeMin != null) appliedFilters.put("changeMin", changeMin);
        if (changeMax != null) appliedFilters.put("changeMax", changeMax);
        if (volumeMin != null) appliedFilters.put("volumeMin", volumeMin);
        if (volumeMax != null) appliedFilters.put("volumeMax", volumeMax);
        appliedFilters.put("sortBy", sortBy != null ? sortBy : "marketCap");
        appliedFilters.put("order", order != null ? order : "desc");
        
        return SearchCoinsResponse.builder()
                .success(true)
                .coins(pagedCoins)
                .totalCount(totalCount)
                .pageSize(pageSize)
                .pageNo(pageNo)
                .hasMore(hasMore)
                .appliedFilters(appliedFilters)
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
    
    public CoinDetailsResponse getCoinDetails(String userId, String symbol) {
        CoinsMeta meta = coinsMetaRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coin not found"));
        
        List<CoinSnapshot> latestList = snapshotsRepository.findLatestSnapshotsForSymbols(List.of(symbol));
        CoinSnapshot latest = latestList.isEmpty() ? null : latestList.get(0);
        if (latest == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No price data available for this coin");
        }
        
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -7);
        Date sevenDaysAgo = cal.getTime();
        List<CoinSnapshot> weekSnapshots = snapshotsRepository.findSnapshotsForSymbolBetweenDates(symbol, sevenDaysAgo, new Date());
        
        Double minPrice = null, maxPrice = null, avgPrice = null;
        if (!weekSnapshots.isEmpty()) {
            minPrice = weekSnapshots.stream().mapToDouble(CoinSnapshot::getPrice).min().orElse(0);
            maxPrice = weekSnapshots.stream().mapToDouble(CoinSnapshot::getPrice).max().orElse(0);
            avgPrice = weekSnapshots.stream().mapToDouble(CoinSnapshot::getPrice).average().orElse(0);
        }
        
        boolean isFavorite = false;
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            isFavorite = user != null && user.getFavorites() != null && user.getFavorites().contains(symbol.toUpperCase());
        }
        
        return CoinDetailsResponse.builder()
                .success(true)
                .symbol(meta.getSymbol())
                .name(meta.getName())
                .price(latest.getPrice())
                .percentChange24h(latest.getPercentChange24h())
                .marketCap(latest.getMarketCap())
                .volume24h(latest.getVolume24h())
                .minPrice7d(minPrice)
                .maxPrice7d(maxPrice)
                .avgPrice7d(avgPrice)
                .isFavorite(isFavorite)
                .lastUpdated(latest.getTimestamp())
                .build();
    }
    
    public CoinHistoryResponse getCoinHistory(String symbol, Date dateFrom, Date dateTo,
                                              Double priceMin, Double priceMax,
                                              Double volumeMin, Double volumeMax,
                                              String sortBy, String order,
                                              int pageSize, int pageNo) {
        CoinsMeta meta = coinsMetaRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coin not found"));
        
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        List<CoinSnapshot> snapshots = snapshotsRepository.findHistoryWithFilters(
                symbol.toUpperCase(), dateFrom, dateTo, priceMin, priceMax, volumeMin, volumeMax,
                sortBy, order, pageSize, pageNo, pageable);
        long totalCount = snapshotsRepository.countHistoryWithFilters(
                symbol.toUpperCase(), dateFrom, dateTo, priceMin, priceMax, volumeMin, volumeMax);
        
        List<CoinHistoryResponse.HistoryEntry> history = snapshots.stream()
                .map(s -> CoinHistoryResponse.HistoryEntry.builder()
                        .timestamp(s.getTimestamp())
                        .price(s.getPrice())
                        .marketCap(s.getMarketCap())
                        .volume24h(s.getVolume24h())
                        .percentChange24h(s.getPercentChange24h())
                        .build())
                .collect(Collectors.toList());
        
        CoinHistoryResponse.DateRange range = CoinHistoryResponse.DateRange.builder()
                .from(dateFrom != null ? dateFrom : (snapshots.isEmpty() ? null : snapshots.get(snapshots.size()-1).getTimestamp()))
                .to(dateTo != null ? dateTo : (snapshots.isEmpty() ? null : snapshots.get(0).getTimestamp()))
                .build();
        
        return CoinHistoryResponse.builder()
                .success(true)
                .symbol(meta.getSymbol())
                .history(history)
                .totalCount(totalCount)
                .dateRange(range)
                .build();
    }
    public FavoritesResponse getFavorites(String userId, int pageSize, int pageNo,
                                        String sortBy, String order,
                                        Double priceMin, Double priceMax,
                                        Double capMin, Double capMax,
                                        Double changeMin, Double changeMax,
                                        Double volumeMin, Double volumeMax) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        List<String> favoriteSymbols = user.getFavorites();
        List<String> finalFavorites = (favoriteSymbols == null) ? new ArrayList<>() : favoriteSymbols;

        if (finalFavorites.isEmpty()) {
            return FavoritesResponse.builder()
                    .success(true)
                    .coins(List.of())
                    .totalCount(0)
                    .pageSize(pageSize)
                    .pageNo(pageNo)
                    .hasMore(false)
                    .build();
        }

        List<CoinsMeta> metas = coinsMetaRepository.findAll().stream()
                .filter(meta -> finalFavorites.contains(meta.getSymbol()))
                .collect(Collectors.toList());

        List<CoinSnapshot> latestSnapshots = snapshotsRepository.findLatestSnapshotsForSymbols(finalFavorites);
        Map<String, CoinSnapshot> snapshotMap = latestSnapshots.stream()
                .collect(Collectors.toMap(CoinSnapshot::getSymbol, s -> s));

        List<CoinDto> allCoins = metas.stream()
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
                            .isFavorite(true) // always true because it's from favorites
                            .lastUpdated(snap.getTimestamp())
                            .build();
                })
                .filter(Objects::nonNull)
                .filter(coin -> applyFilters(coin, priceMin, priceMax, capMin, capMax, changeMin, changeMax, volumeMin, volumeMax))
                .collect(Collectors.toList());

        Comparator<CoinDto> comparator = getComparator(sortBy, order);
        allCoins.sort(comparator);

        long totalCount = allCoins.size();
        int start = pageNo * pageSize;
        int end = Math.min(start + pageSize, allCoins.size());
        List<CoinDto> pagedCoins = (start < allCoins.size()) ? allCoins.subList(start, end) : new ArrayList<>();
        boolean hasMore = end < totalCount;

        return FavoritesResponse.builder()
                .success(true)
                .coins(pagedCoins)
                .totalCount(totalCount)
                .pageSize(pageSize)
                .pageNo(pageNo)
                .hasMore(hasMore)
                .build();
    }

    public AddCoinResponse addToFavorites(String userId, String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Symbol is required");
        }
        symbol = symbol.toUpperCase();

        CoinsMeta coinMeta = coinsMetaRepository.findBySymbol(symbol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<String> favorites = user.getFavorites();
        if (favorites == null) favorites = new ArrayList<>();

        if (favorites.contains(symbol)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin already in favorites");
        }

        favorites.add(symbol);
        user.setFavorites(favorites);
        userRepository.save(user);

        AddCoinResponse.CoinInfo coinInfo = AddCoinResponse.CoinInfo.builder()
                .symbol(coinMeta.getSymbol())
                .name(coinMeta.getName())
                .build();

        return AddCoinResponse.builder()
                .success(true)
                .message(symbol + " added to favorites")
                .coin(coinInfo)
                .build();
    }

    public DeleteCoinResponse removeFromFavorites(String userId, String symbol) {
        if (symbol == null || symbol.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid symbol");
        }
        symbol = symbol.toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<String> favorites = user.getFavorites();
        if (favorites == null || !favorites.contains(symbol)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coin not in favorites");
        }

        favorites.remove(symbol);
        user.setFavorites(favorites);
        userRepository.save(user);

        return DeleteCoinResponse.builder()
                .success(true)
                .message(symbol + " removed from favorites")
                .build();
    }
}