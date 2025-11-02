export const FLINK_CONFIG = {
  SQL_GATEWAY_URL: process.env.FLINK_SQL_GATEWAY_URL || "http://localhost:8083",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "pkc-rgm37.us-west-2.aws.confluent.cloud:9092",
  KAFKA_API_KEY: process.env.KAFKA_API_KEY || "",
  KAFKA_API_SECRET: process.env.KAFKA_API_SECRET || "",
};

// Flink SQL DDL to create the transactions source table
export const FLINK_DDL = {
  CREATE_TRANSACTIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS transactions_topic (
      transaction_id STRING,
      booking_jurisdiction STRING,
      regulator STRING,
      booking_datetime STRING,
      value_date STRING,
      amount DOUBLE,
      currency STRING,
      channel STRING,
      product_type STRING,
      originator_name STRING,
      originator_account STRING,
      originator_country STRING,
      beneficiary_name STRING,
      beneficiary_account STRING,
      beneficiary_country STRING,
      swift_mt STRING,
      ordering_institution_bic STRING,
      beneficiary_institution_bic STRING,
      swift_f50_present BOOLEAN,
      swift_f59_present BOOLEAN,
      swift_f70_purpose STRING,
      swift_f71_charges STRING,
      travel_rule_complete BOOLEAN,
      fx_indicator BOOLEAN,
      fx_base_ccy STRING,
      fx_quote_ccy STRING,
      fx_applied_rate DOUBLE,
      fx_market_rate DOUBLE,
      fx_spread_bps DOUBLE,
      fx_counterparty STRING,
      customer_id STRING,
      customer_type STRING,
      customer_risk_rating STRING,
      customer_is_pep BOOLEAN,
      kyc_last_completed STRING,
      kyc_due_date STRING,
      edd_required BOOLEAN,
      edd_performed BOOLEAN,
      sow_documented BOOLEAN,
      purpose_code STRING,
      narrative STRING,
      is_advised BOOLEAN,
      product_complex BOOLEAN,
      client_risk_profile STRING,
      suitability_assessed BOOLEAN,
      suitability_result STRING,
      product_has_va_exposure BOOLEAN,
      va_disclosure_provided BOOLEAN,
      cash_id_verified BOOLEAN,
      daily_cash_total_customer DOUBLE,
      daily_cash_txn_count BIGINT,
      sanctions_screening STRING,
      suspicion_determined_datetime STRING,
      str_filed_datetime STRING,
      proctime AS PROCTIME()
    ) WITH (
      'connector' = 'kafka',
      'topic' = 'transaction',
      'properties.bootstrap.servers' = '${FLINK_CONFIG.KAFKA_BROKERS}',
      'properties.security.protocol' = 'SASL_SSL',
      'properties.sasl.mechanism' = 'PLAIN',
      'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${FLINK_CONFIG.KAFKA_API_KEY}" password="${FLINK_CONFIG.KAFKA_API_SECRET}";',
      'properties.group.id' = 'flink-consumer-group',
      'scan.startup.mode' = 'earliest-offset',
      'format' = 'json',
      'json.fail-on-missing-field' = 'false',
      'json.ignore-parse-errors' = 'true'
    )
  `,

  CREATE_ALERTS_TABLE: `
    CREATE TABLE IF NOT EXISTS alerts_topic (
      window_start TIMESTAMP(3),
      window_end TIMESTAMP(3),
      transaction_id STRING,
      sender_id STRING,
      receiver_id STRING,
      transaction_count BIGINT,
      total_amount DOUBLE,
      alert_type STRING,
      alert_id STRING,
      priority STRING,
      status STRING
    ) WITH (
      'connector' = 'kafka',
      'topic' = 'alerts',
      'properties.bootstrap.servers' = '${FLINK_CONFIG.KAFKA_BROKERS}',
      'properties.security.protocol' = 'SASL_SSL',
      'properties.sasl.mechanism' = 'PLAIN',
      'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${FLINK_CONFIG.KAFKA_API_KEY}" password="${FLINK_CONFIG.KAFKA_API_SECRET}";',
      'format' = 'json'
    )
  `
};

export const FLINK_SQL_QUERIES = {
  // High frequency or large amount detection per customer
  ANOMALY_DETECTION_HIGH_FREQUENCY: `
    INSERT INTO alerts_topic
    SELECT
      TUMBLE_START(proctime, INTERVAL '10' SECOND) as window_start,
      TUMBLE_END(proctime, INTERVAL '10' SECOND) as window_end,
      customer_id as transaction_id,
      originator_account as sender_id,
      beneficiary_account as receiver_id,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      'high_frequency_transactions' as alert_type,
      CONCAT('alert-', CAST(UNIX_TIMESTAMP() AS STRING), '-', customer_id) as alert_id,
      CASE
        WHEN SUM(amount) > 50000 THEN 'high'
        WHEN SUM(amount) > 20000 THEN 'medium'
        ELSE 'low'
      END as priority,
      'open' as status
    FROM transactions_topic
    GROUP BY
      customer_id,
      originator_account,
      beneficiary_account,
      TUMBLE(proctime, INTERVAL '10' SECOND)
    HAVING
      COUNT(*) > 5 OR SUM(amount) > 10000
  `,

  // Suspicious pattern detection - customer sending to multiple beneficiaries rapidly
  ANOMALY_DETECTION_MULTIPLE_RECEIVERS: `
    INSERT INTO alerts_topic
    SELECT
      TUMBLE_START(proctime, INTERVAL '30' SECOND) as window_start,
      TUMBLE_END(proctime, INTERVAL '30' SECOND) as window_end,
      customer_id as transaction_id,
      originator_account as sender_id,
      '' as receiver_id,
      COUNT(DISTINCT beneficiary_account) as transaction_count,
      SUM(amount) as total_amount,
      'multiple_receivers_pattern' as alert_type,
      CONCAT('alert-', CAST(UNIX_TIMESTAMP() AS STRING), '-', customer_id) as alert_id,
      'high' as priority,
      'open' as status
    FROM transactions_topic
    GROUP BY
      customer_id,
      originator_account,
      TUMBLE(proctime, INTERVAL '30' SECOND)
    HAVING
      COUNT(DISTINCT beneficiary_account) > 10
  `,

  // PEP (Politically Exposed Person) high value transactions
  ANOMALY_DETECTION_PEP_TRANSACTIONS: `
    INSERT INTO alerts_topic
    SELECT
      TUMBLE_START(proctime, INTERVAL '60' SECOND) as window_start,
      TUMBLE_END(proctime, INTERVAL '60' SECOND) as window_end,
      transaction_id,
      originator_account as sender_id,
      beneficiary_account as receiver_id,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      'pep_high_value_transaction' as alert_type,
      CONCAT('alert-pep-', CAST(UNIX_TIMESTAMP() AS STRING), '-', customer_id) as alert_id,
      'high' as priority,
      'open' as status
    FROM transactions_topic
    WHERE customer_is_pep = TRUE AND amount > 100000
    GROUP BY
      transaction_id,
      customer_id,
      originator_account,
      beneficiary_account,
      TUMBLE(proctime, INTERVAL '60' SECOND)
  `,

  // High risk customer transactions
  ANOMALY_DETECTION_HIGH_RISK_CUSTOMER: `
    INSERT INTO alerts_topic
    SELECT
      TUMBLE_START(proctime, INTERVAL '30' SECOND) as window_start,
      TUMBLE_END(proctime, INTERVAL '30' SECOND) as window_end,
      customer_id as transaction_id,
      originator_account as sender_id,
      beneficiary_account as receiver_id,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      'high_risk_customer_activity' as alert_type,
      CONCAT('alert-risk-', CAST(UNIX_TIMESTAMP() AS STRING), '-', customer_id) as alert_id,
      'high' as priority,
      'open' as status
    FROM transactions_topic
    WHERE customer_risk_rating = 'High' AND amount > 50000
    GROUP BY
      customer_id,
      originator_account,
      beneficiary_account,
      TUMBLE(proctime, INTERVAL '30' SECOND)
  `
};
