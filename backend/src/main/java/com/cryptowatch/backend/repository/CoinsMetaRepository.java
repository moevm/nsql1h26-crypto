package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.CoinsMeta;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CoinsMetaRepository extends MongoRepository<CoinsMeta, String> {
    Optional<CoinsMeta> findBySymbol(String symbol);
    
    @Query("{ $or: [ { 'symbol': { $regex: ?0, $options: 'i' } }, { 'name': { $regex: ?0, $options: 'i' } } ] }")
    List<CoinsMeta> searchBySymbolOrName(String query);
}