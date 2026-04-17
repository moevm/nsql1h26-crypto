package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.CoinsMeta;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CoinsMetaRepository extends MongoRepository<CoinsMeta, String> {
    Optional<CoinsMeta> findBySymbol(String symbol);
}