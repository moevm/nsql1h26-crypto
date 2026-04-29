package com.cryptowatch.backend.repository;

import com.cryptowatch.backend.model.BlacklistedToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BlacklistedTokenRepository extends MongoRepository<BlacklistedToken, String> {}