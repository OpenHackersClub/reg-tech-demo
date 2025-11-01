# Data Model: AI Compliance Agent System

This document defines the data model for the key entities in the AI Compliance Agent System.

## Key Entities

### 1. RegulatoryRule

A structured representation of a compliance rule, parsed from an external source.

*   **id**: `string` (unique identifier)
*   **version**: `string` (e.g., "1.2.0")
*   **jurisdiction**: `string` (e.g., "MAS", "FINMA", "HKMA")
*   **rule_text**: `string` (the original text of the rule)
*   **structured_logic**: `jsonb` (the parsed logic of the rule)
*   **created_at**: `timestamp`
*   **updated_at**: `timestamp`

### 2. Transaction

A single financial transaction.

*   **id**: `string` (unique identifier)
*   **amount**: `decimal`
*   **currency**: `string`
*   **sender_id**: `string`
*   **receiver_id**: `string`
*   **timestamp**: `timestamp`

### 3. Alert

A system-generated notification of a potential compliance issue.

*   **id**: `string` (unique identifier)
*   **priority**: `enum` ("high", "medium", "low")
*   **type**: `string` (e.g., "suspicious_transaction", "document_forgery")
*   **status**: `enum` ("open", "in_progress", "closed")
*   **assigned_to**: `string` (user or role ID)
*   **transaction_id**: `string` (foreign key to Transaction)
*   **client_document_id**: `string` (foreign key to ClientDocument)
*   **created_at**: `timestamp`
*   **updated_at**: `timestamp`

### 4. ClientDocument

A file (PDF, image, etc.) uploaded for a client, with associated metadata and analysis results.

*   **id**: `string` (unique identifier)
*   **client_id**: `string`
*   **file_name**: `string`
*   **file_path**: `string` (path in object storage)
*   **analysis_results**: `jsonb`
*   **created_at**: `timestamp`
*   **updated_at**: `timestamp`

### 5. RiskReport

A consolidated report detailing all findings for a client, including a unified risk score.

*   **id**: `string` (unique identifier)
*   **client_id**: `string`
*   **risk_score**: `decimal`
*   **report_data**: `jsonb`
*   **created_at**: `timestamp`

### 6. AuditTrail

A log of all actions taken within the system.

*   **id**: `string` (unique identifier)
*   **user_id**: `string`
*   **action**: `string` (e.g., "create_alert", "close_case")
*   **details**: `jsonb`
*   **timestamp**: `timestamp`