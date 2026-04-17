package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.StatisticsPreset;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StatisticsPresetRepository extends MongoRepository<StatisticsPreset, String> {
    List<StatisticsPreset> findByUserId(String userId, Pageable pageable);
    long countByUserId(String userId);
    Optional<StatisticsPreset> findByUserIdAndName(String userId, String name);
    Optional<StatisticsPreset> findByIdAndUserId(String id, String userId);
    boolean existsByUserIdAndName(String userId, String name);
}   