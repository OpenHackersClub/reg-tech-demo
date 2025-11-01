<!--
Sync Impact Report:
- Version change: 1.5.0 → 1.6.0
- List of modified principles:
    - None
- Added sections:
    - XIV. Local Development Environment
- Removed sections: None
- Templates requiring updates:
    - ✅ .specify/templates/plan-template.md
- Follow-up TODOs:
    - TODO(SECTION_2_NAME): Define additional constraints, security requirements, or performance standards.
    - TODO(SECTION_3_NAME): Define the development workflow, review process, and quality gates.
    - TODO(GOVERNANCE_RULES): Define the governance rules for the project.
-->
# Reg-Tech Demo Constitution

## Core Principles

### I. Real-Time Streaming Platform
The system MUST use Confluent Kafka as the real-time streaming platform for all event-driven data flows. This ensures a scalable and resilient architecture for handling high-volume, real-time data streams, which is critical for AML monitoring.

### II. Frontend Development Stack
The frontend MUST be developed using React 19, with shadcn for UI components and Tailwind CSS for styling. This provides a modern, efficient, and consistent development experience for building user interfaces.

### III. Linter and Formatter
The project MUST use Biome for linting and formatting. ESLint is explicitly disallowed. This ensures a single, fast, and consistent tool for maintaining code quality and style across the entire codebase.

### IV. Testing Framework
The project MUST use Vitest for all unit and integration tests. Jest is explicitly disallowed. This choice prioritizes performance and a modern testing experience that integrates well with the chosen frontend stack.

### V. TypeScript Style
The project MUST use Effect-TS for handling side effects and asynchronous operations whenever possible. This encourages a functional programming style, improving code clarity, testability, and error handling.

### VI. Workflow Integration
The system MUST use RESTful APIs to interact with n8n workflow systems. This provides a standardized and decoupled way to integrate with external workflow automation tools.

### VII. Boolean Naming Convention
All boolean variables and functions MUST use the `isTrue` naming convention (e.g., `isUserActive`, `isPaymentVerified`). This ensures clarity and consistency in boolean logic throughout the codebase.

### VIII. Infrastructure as Code
The project MUST use Pulumi for Infrastructure as Code (IaC). This allows for managing and provisioning infrastructure using a consistent, programmatic approach, improving automation and reducing manual errors.

### IX. Local CI Execution
The project MUST use Dagger for local CI execution. This ensures that CI/CD pipelines can be developed and tested locally, improving developer productivity and reducing integration issues.

### X. Test-Driven Development
A test-driven development (TDD) approach is mandatory. Tests MUST be written before the implementation, and the implementation must be written to pass the tests. This ensures that all code is testable and that the tests accurately reflect the requirements.

### XI. Kafka Client
The project MUST use `@confluentinc/kafka-javascript` for all Kafka client interactions. `kafkajs` is explicitly disallowed. This ensures compatibility with the Confluent Cloud and leverages the officially supported client.

### XII. Stream Processing
The project MUST use Apache Flink for stream processing and real-time analytics. This allows for stateful computations over data streams, which is essential for complex AML transaction monitoring.

### XIII. Cloud Provisioning
The project MUST use Pulumi to provision Confluent Cloud resources. This ensures that the cloud infrastructure is managed as code, providing a single source of truth for the entire system's configuration.

### XIV. Local Development Environment
The project MUST use Dagger for managing local development services. Docker Compose is explicitly disallowed. This ensures a consistent and reproducible development environment that aligns with the local CI execution strategy.

## TODO(SECTION_2_NAME)
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

TODO: Define additional constraints, security requirements, or performance standards.
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## TODO(SECTION_3_NAME)
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

TODO: Define the development workflow, review process, and quality gates.
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

TODO: Define the governance rules for the project.
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.6.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01