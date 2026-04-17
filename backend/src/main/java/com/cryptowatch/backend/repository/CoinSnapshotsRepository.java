package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.CoinSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface CoinSnapshotsRepository extends MongoRepository<CoinSnapshot, String>, CoinSnapshotsRepositoryCustom {
}

interface CoinSnapshotsRepositoryCustom {
    List<CoinSnapshot> findLatestSnapshotsForSymbols(List<String> symbols);
    
    List<CoinSnapshot> findSnapshotsForSymbolBetweenDates(String symbol, Date from, Date to);
    List<CoinSnapshot> findHistoryWithFilters(String symbol, Date dateFrom, Date dateTo,
                                               Double priceMin, Double priceMax,
                                               Double volumeMin, Double volumeMax,
                                               String sortBy, String order,
                                               int pageSize, int pageNo,
                                               org.springframework.data.domain.Pageable pageable);
    long countHistoryWithFilters(String symbol, Date dateFrom, Date dateTo,
                                 Double priceMin, Double priceMax,
                                 Double volumeMin, Double volumeMax);
}

class CoinSnapshotsRepositoryImpl implements CoinSnapshotsRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public CoinSnapshotsRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<CoinSnapshot> findLatestSnapshotsForSymbols(List<String> symbols) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("symbol").in(symbols)),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "timestamp")),
                Aggregation.group("symbol")
                        .first("$$ROOT").as("latest"),
                Aggregation.replaceRoot("latest")
        );
        AggregationResults<CoinSnapshot> results = mongoTemplate.aggregate(
                aggregation, "coin_snapshots", CoinSnapshot.class);
        return results.getMappedResults();
    }
    @Override
    public List<CoinSnapshot> findSnapshotsForSymbolBetweenDates(String symbol, Date from, Date to) {
        Criteria criteria = Criteria.where("symbol").is(symbol);
        if (from != null) criteria = criteria.and("timestamp").gte(from);
        if (to != null) criteria = criteria.and("timestamp").lte(to);
        Query query = new Query(criteria).with(Sort.by(Sort.Direction.ASC, "timestamp"));
        return mongoTemplate.find(query, CoinSnapshot.class);
    }

    @Override
    public List<CoinSnapshot> findHistoryWithFilters(String symbol, Date dateFrom, Date dateTo,
                                                    Double priceMin, Double priceMax,
                                                    Double volumeMin, Double volumeMax,
                                                    String sortBy, String order,
                                                    int pageSize, int pageNo,
                                                    Pageable pageable) {
        Criteria criteria = Criteria.where("symbol").is(symbol);
        if (dateFrom != null) criteria = criteria.and("timestamp").gte(dateFrom);
        if (dateTo != null) criteria = criteria.and("timestamp").lte(dateTo);
        if (priceMin != null) criteria = criteria.and("price").gte(priceMin);
        if (priceMax != null) criteria = criteria.and("price").lte(priceMax);
        if (volumeMin != null) criteria = criteria.and("volume24h").gte(volumeMin);
        if (volumeMax != null) criteria = criteria.and("volume24h").lte(volumeMax);
        
        Query query = new Query(criteria).with(pageable);
        String sortField = "timestamp";
        if ("price".equals(sortBy)) sortField = "price";
        else if ("volume24h".equals(sortBy)) sortField = "volume24h";
        Sort.Direction direction = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        query.with(Sort.by(direction, sortField));
        
        return mongoTemplate.find(query, CoinSnapshot.class);
    }

    @Override
    public long countHistoryWithFilters(String symbol, Date dateFrom, Date dateTo,
                                        Double priceMin, Double priceMax,
                                        Double volumeMin, Double volumeMax) {
        Criteria criteria = Criteria.where("symbol").is(symbol);
        if (dateFrom != null) criteria = criteria.and("timestamp").gte(dateFrom);
        if (dateTo != null) criteria = criteria.and("timestamp").lte(dateTo);
        if (priceMin != null) criteria = criteria.and("price").gte(priceMin);
        if (priceMax != null) criteria = criteria.and("price").lte(priceMax);
        if (volumeMin != null) criteria = criteria.and("volume24h").gte(volumeMin);
        if (volumeMax != null) criteria = criteria.and("volume24h").lte(volumeMax);
        Query query = new Query(criteria);
        return mongoTemplate.count(query, CoinSnapshot.class);
    }
}