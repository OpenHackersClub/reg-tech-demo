# Implementation Plan: AI Compliance Agent System

**Branch**: `001-aml-compliance-agent` | **Date**: 2025-11-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-aml-compliance-agent/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation of an AI Compliance Agent System for Anti-Money Laundering (AML). The system will use a real-time streaming platform to monitor transactions, and a document corroboration module to verify client-submitted documents. The system will be built with a focus on open-source components and a "Bring Your Own Cloud" (BYOC) deployment model.

## Technical Context

**Language/Version**: TypeScript, Java/Scala (for Flink)
**Primary Dependencies**: React 19, shadcn, Tailwind CSS, Effect-TS, confluent-kafka-javascript, Apache Flink, Pulumi, Confluent Control Center, Flink Web Dashboard
**Storage**: PostgreSQL for structured data, MinIO (S3-compatible) for object storage
**Testing**: Vitest, Dagger for integration tests
**Target Platform**: Kubernetes
**Project Type**: Web application (frontend/backend) with a stream processing component and IaC
**Performance Goals**: Process 1,000 transactions per minute, with 99.9% of transactions analyzed in under 1 second.
**Constraints**: Must use open-source components, BYOC deployment.
**Scale/Scope**: 1,000 transactions per minute.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [X] **I. Real-Time Streaming Platform**: Is Confluent Kafka used for real-time streaming?
- [X] **II. Frontend Development Stack**: Is the frontend built with React 19, shadcn, and Tailwind CSS?
- [X] **III. Linter and Formatter**: Is Biome used for linting and formatting?
- [X] **IV. Testing Framework**: Are tests written with Vitest?
- [X] **V. TypeScript Style**: Is Effect-TS used for side effects and async operations?
- [X] **VI. Workflow Integration**: Are RESTful APIs used to interact with n8n?
- [ ] **VII. Boolean Naming Convention**: Do boolean variables follow the `isTrue` convention? (Code-level, to be checked during implementation)
- [X] **VIII. Infrastructure as Code**: Is Pulumi used for IaC?
- [X] **IX. Local CI Execution**: Is Dagger used for local CI execution?
- [X] **X. Test-Driven Development**: Is a test-driven approach being followed?
- [X] **XI. Kafka Client**: Is `confluent-kafka-javascript` used for Kafka client interactions?
- [X] **XII. Stream Processing**: Is Apache Flink used for stream processing?
- [X] **XIII. Cloud Provisioning**: Is Pulumi used to provision Confluent Cloud resources?
- [X] **XIV. Local Development Environment**: Is Dagger used for managing local development services?

## Project Structure

### Documentation (this feature)

```text
specs/001-aml-compliance-agent/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   └── tests/
└── api/
    ├── src/
    │   ├── models/
    │   ├── services/
    │   └── workers/
    └── tests/

packages/
├── kafka-client/
│   └── src/
├── transaction-fixtures/
│   └── src/
├── flink-jobs/
│   └── src/
└── pulumi/
    └── src/
```

**Structure Decision**: The project will be structured as a monorepo with separate `apps` for the web frontend and the backend API. A `packages` directory will contain shared libraries for Kafka client, transaction fixtures, Flink jobs, and Pulumi infrastructure. Dagger will be used to manage local services, including Kafka, Flink, and their respective UIs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |
