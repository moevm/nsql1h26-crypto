package com.cryptowatch.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "coins_meta")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoinsMeta {
    @Id
    private String id;

    @Indexed(unique = true)
    private String symbol;

    private String name;
    private int cmcId;
    private Date lastUpdated;
}