package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.StatisticsSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StatisticsSettingsRepository extends MongoRepository<StatisticsSettings, String> {
}