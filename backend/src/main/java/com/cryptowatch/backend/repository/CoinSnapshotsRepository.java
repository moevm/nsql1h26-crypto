package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.CoinSnapshot;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoinSnapshotsRepository extends MongoRepository<CoinSnapshot, String>, CoinSnapshotsRepositoryCustom {
}

interface CoinSnapshotsRepositoryCustom {
    List<CoinSnapshot> findLatestSnapshotsForSymbols(List<String> symbols);
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
}