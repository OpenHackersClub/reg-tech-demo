import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Transaction interface matching Confluent Cloud Avro schema
 * Schema: com.mycorp.mynamespace.SampleRecord
 * Fields ordered alphabetically as per schema definition
 */
export interface Transaction {
  amount: number; // int in schema
  beneficiary_account: string;
  beneficiary_country: string;
  beneficiary_institution_bic: string;
  beneficiary_name: string;
  booking_datetime: string;
  booking_jurisdiction: string;
  cash_id_verified: boolean;
  channel: string;
  client_risk_profile: string;
  currency: string;
  customer_id: string;
  customer_is_pep: boolean;
  customer_risk_rating: string;
  customer_type: string;
  daily_cash_total_customer: number; // int in schema
  daily_cash_txn_count: number; // int in schema
  edd_performed: boolean;
  edd_required: boolean;
  fx_applied_rate: number; // int in schema
  fx_base_ccy: string;
  fx_counterparty: string;
  fx_indicator: boolean;
  fx_market_rate: number; // int in schema
  fx_quote_ccy: string;
  fx_spread_bps: number; // int in schema
  is_advised: boolean;
  kyc_due_date: string;
  kyc_last_completed: string;
  narrative: string;
  ordering_institution_bic: string;
  originator_account: string;
  originator_country: string;
  originator_name: string;
  product_complex: boolean;
  product_has_va_exposure: boolean;
  product_type: string;
  purpose_code: string;
  regulator: string;
  sanctions_screening: string;
  sow_documented: boolean;
  str_filed_datetime: string;
  suitability_assessed: boolean;
  suitability_result: string;
  suspicion_determined_datetime: string;
  swift_f50_present: boolean;
  swift_f59_present: boolean;
  swift_f70_purpose: string;
  swift_f71_charges: string;
  swift_mt: string;
  transaction_id: string;
  travel_rule_complete: boolean;
  va_disclosure_provided: boolean;
  value_date: string;
}

/**
 * Type casting function to ensure values match Avro schema types
 */
function castToAvroSchema(record: any): Transaction {
  return {
    // Integer fields (Avro int type)
    amount: parseInt(record.amount, 10),
    daily_cash_total_customer: parseInt(record.daily_cash_total_customer, 10),
    daily_cash_txn_count: parseInt(record.daily_cash_txn_count, 10),
    fx_applied_rate: parseInt(record.fx_applied_rate, 10),
    fx_market_rate: parseInt(record.fx_market_rate, 10),
    fx_spread_bps: parseInt(record.fx_spread_bps, 10),

    // Boolean fields
    cash_id_verified: record.cash_id_verified === 'true' || record.cash_id_verified === true,
    customer_is_pep: record.customer_is_pep === 'true' || record.customer_is_pep === true,
    edd_performed: record.edd_performed === 'true' || record.edd_performed === true,
    edd_required: record.edd_required === 'true' || record.edd_required === true,
    fx_indicator: record.fx_indicator === 'true' || record.fx_indicator === true,
    is_advised: record.is_advised === 'true' || record.is_advised === true,
    product_complex: record.product_complex === 'true' || record.product_complex === true,
    product_has_va_exposure: record.product_has_va_exposure === 'true' || record.product_has_va_exposure === true,
    sow_documented: record.sow_documented === 'true' || record.sow_documented === true,
    suitability_assessed: record.suitability_assessed === 'true' || record.suitability_assessed === true,
    swift_f50_present: record.swift_f50_present === 'true' || record.swift_f50_present === true,
    swift_f59_present: record.swift_f59_present === 'true' || record.swift_f59_present === true,
    travel_rule_complete: record.travel_rule_complete === 'true' || record.travel_rule_complete === true,
    va_disclosure_provided: record.va_disclosure_provided === 'true' || record.va_disclosure_provided === true,

    // String fields (convert to string and trim)
    beneficiary_account: String(record.beneficiary_account || '').trim(),
    beneficiary_country: String(record.beneficiary_country || '').trim(),
    beneficiary_institution_bic: String(record.beneficiary_institution_bic || '').trim(),
    beneficiary_name: String(record.beneficiary_name || '').trim(),
    booking_datetime: String(record.booking_datetime || '').trim(),
    booking_jurisdiction: String(record.booking_jurisdiction || '').trim(),
    channel: String(record.channel || '').trim(),
    client_risk_profile: String(record.client_risk_profile || '').trim(),
    currency: String(record.currency || '').trim(),
    customer_id: String(record.customer_id || '').trim(),
    customer_risk_rating: String(record.customer_risk_rating || '').trim(),
    customer_type: String(record.customer_type || '').trim(),
    fx_base_ccy: String(record.fx_base_ccy || '').trim(),
    fx_counterparty: String(record.fx_counterparty || '').trim(),
    fx_quote_ccy: String(record.fx_quote_ccy || '').trim(),
    kyc_due_date: String(record.kyc_due_date || '').trim(),
    kyc_last_completed: String(record.kyc_last_completed || '').trim(),
    narrative: String(record.narrative || '').trim(),
    ordering_institution_bic: String(record.ordering_institution_bic || '').trim(),
    originator_account: String(record.originator_account || '').trim(),
    originator_country: String(record.originator_country || '').trim(),
    originator_name: String(record.originator_name || '').trim(),
    product_type: String(record.product_type || '').trim(),
    purpose_code: String(record.purpose_code || '').trim(),
    regulator: String(record.regulator || '').trim(),
    sanctions_screening: String(record.sanctions_screening || '').trim(),
    str_filed_datetime: String(record.str_filed_datetime || '').trim(),
    suitability_result: String(record.suitability_result || '').trim(),
    suspicion_determined_datetime: String(record.suspicion_determined_datetime || '').trim(),
    swift_f70_purpose: String(record.swift_f70_purpose || '').trim(),
    swift_f71_charges: String(record.swift_f71_charges || '').trim(),
    swift_mt: String(record.swift_mt || '').trim(),
    transaction_id: String(record.transaction_id || '').trim(),
    value_date: String(record.value_date || '').trim(),
  };
}

export async function loadTransactions(filePath: string): Promise<Transaction[]> {
  const csvFilePath = path.resolve(filePath);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      cast: false, // Disable automatic casting, we'll do it manually
      trim: true,
    }, (error, result: any[]) => {
      if (error) {
        reject(error);
      } else {
        // Cast each record to match Avro schema types
        const transactions = result.map(castToAvroSchema);
        resolve(transactions);
      }
    });
  });
}
