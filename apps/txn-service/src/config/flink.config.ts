export const FLINK_CONFIG = {
  SQL_GATEWAY_URL: process.env.FLINK_SQL_GATEWAY_URL || "http://localhost:8083",
  // Add other Flink related configurations here, e.g., API keys, secrets
};

export const FLINK_SQL_QUERIES = {
  ANOMALY_DETECTION: `
    INSERT INTO alerts_topic
    SELECT
      TUMBLE_START(proctime, INTERVAL '10' SECOND) as window_start,
      TUMBLE_END(proctime, INTERVAL '10' SECOND) as window_end,
      transaction_id,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      'high_frequency_transactions' as alert_type
    FROM transactions_topic
    GROUP BY
      transaction_id,
      TUMBLE(proctime, INTERVAL '10' SECOND)
    HAVING
      COUNT(*) > 5 OR SUM(amount) > 10000;
  `,
  // Define other Flink SQL queries here
};
