package com.regtechdemo;

import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.api.common.serialization.SerializationSchema;

public class TransactionAnalysisJob {

    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Kafka Source for Transactions
        KafkaSource<String> transactionSource = KafkaSource.<String>builder()
                .setBootstrapServers("localhost:9092") // Replace with your Kafka broker address
                .setTopics("transactions")
                .setGroupId("flink-transaction-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // Kafka Sink for Alerts
        KafkaSink<String> alertSink = KafkaSink.<String>builder()
                .setBootstrapServers("localhost:9092") // Replace with your Kafka broker address
                .setRecordSerializer(new SerializationSchema<String>() {
                    @Override
                    public byte[] serialize(String element) {
                        return element.getBytes();
                    }
                })
                .setDeliverGuarantee(org.apache.flink.connector.kafka.sink.KafkaSink.DeliveryGuarantee.AT_LEAST_ONCE)
                .setTopic("alerts")
                .build();

        env.fromSource(transactionSource, WatermarkStrategy.noWatermarks(), "Kafka Transactions")
                .filter(transaction -> {
                    // Simple rule: alert if amount > 1000 (assuming transaction is a JSON string with an 'amount' field)
                    // In a real application, you would parse the JSON and apply more complex logic
                    try {
                        // This is a very basic parsing. In a real app, use a proper JSON parser.
                        String amountStr = transaction.split("\"amount\":")[1].split(",")[0];
                        double amount = Double.parseDouble(amountStr);
                        return amount > 1000;
                    } catch (Exception e) {
                        System.err.println("Could not parse transaction: " + transaction + ", Error: " + e.getMessage());
                        return false;
                    }
                })
                .map(transaction -> "{" + transaction.split("\{")[1].replaceFirst("\}", ",\"alertType\":\"high_value_transaction\"}") ) // Add alert type
                .sinkTo(alertSink);

        env.execute("Transaction Analysis Job");
    }
}
