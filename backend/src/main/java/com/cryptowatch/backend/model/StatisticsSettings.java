package com.cryptowatch.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "statistics_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsSettings {
    @Id
    private String id;
    private String key;
    private Object value;
    private Date updatedAt;
}