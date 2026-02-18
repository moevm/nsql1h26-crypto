package io.github.kylichist;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.time.Instant;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String uri = System.getenv().getOrDefault("MONGO_URI", "mongodb://localhost:27017");
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("crypto-db");
            MongoCollection<Document> collection = database.getCollection("coin_snapshots");

            collection.drop();

            List<Document> docs = List.of(new Document("symbol", "BTC").append("price", 67000).append("timestamp", Instant.now()),
                    new Document("symbol", "ETH").append("price", 3200).append("timestamp", Instant.now()),
                    new Document("symbol", "SOL").append("price", 150).append("timestamp", Instant.now()));

            collection.insertMany(docs);

            System.out.println("Inserted documents:");

            collection.find().forEach(doc -> System.out.println(doc.toJson()));
        }
    }
}
