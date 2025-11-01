# Research: AI Compliance Agent System

## Phase 0: Outline & Research

This document outlines the research tasks required to resolve ambiguities in the technical plan and to define best practices for the selected technologies.

### Research Tasks

1.  **Storage Solution for Audit Trail and Reports**:
    *   **Task**: Investigate and recommend a persistent storage solution for the audit trail, risk reports, and other key entities.
    *   **Considerations**: Scalability, security, and compatibility with the BYOC deployment model.
    *   **Options**:
        *   **PostgreSQL**: A robust, open-source relational database.
        *   **ClickHouse**: A fast, open-source, column-oriented database management system that allows generating analytical data reports in real time.
        *   **S3-compatible object storage**: For storing large artifacts like reports and documents.

2.  **Target Platform for BYOC Deployment**:
    *   **Task**: Define the target platform for the "Bring Your Own Cloud" (BYOC) deployment model.
    *   **Considerations**: Cloud-agnosticism, ease of deployment, and management.
    *   **Recommendation**: A Kubernetes-based deployment seems most appropriate, as it is supported by all major cloud providers and offers a consistent deployment target.

3.  **Best Practices for Dagger in Local CI and Development**:
    *   **Task**: Research and document best practices for using Dagger for local CI execution and development services.
    *   **Areas to cover**:
        *   Structuring Dagger pipelines for a monorepo.
        *   Integrating with Vitest for testing.
        *   Running services (like Kafka, Flink, and UIs) within Dagger for integration tests and local development.

4.  **Using Confluent Local for Development and Testing**:
    *   **Task**: Document the setup and usage of `confluent local` for running a local Kafka instance.
    *   **Areas to cover**:
        *   Starting and stopping the local Confluent Platform.
        *   Creating topics for the AML system.
        *   Integrating with the application for local development and integration testing.

5.  **Ingesting CSV data into Kafka**:
    *   **Task**: Research and document the best way to ingest CSV data into a Kafka stream for processing.
    *   **Options**:
        *   **Kafka Connect**: Use a CSV source connector.
        *   **Custom Producer**: Write a custom Kafka producer in TypeScript to read the CSV file and publish messages to a Kafka topic.

6.  **Stream Processing with Apache Flink**:
    *   **Task**: Research and document how to use Apache Flink for real-time stream processing.
    *   **Areas to cover**:
        *   Setting up a Flink development environment.
        *   Connecting Flink to a Kafka topic.
        *   Writing a Flink job to analyze the transaction stream.
        *   Running a Flink cluster locally for development and testing.

7.  **Provisioning Confluent Cloud with Pulumi**:
    *   **Task**: Research and document how to use Pulumi to provision Confluent Cloud resources.
    *   **Areas to cover**:
        *   Setting up the Pulumi Confluent provider.
        *   Provisioning a Kafka cluster, topics, and service accounts.
        *   Managing API keys and secrets.

8.  **Kafka and Flink UIs**:
    *   **Task**: Research and recommend UIs for monitoring and managing local Kafka and Flink instances.
    *   **Options for Kafka UI**:
        *   **Confluent Control Center**: Included with `confluent local`.
        *   **AKHQ (formerly KafkaHQ)**: A popular open-source Kafka UI.
    *   **Options for Flink UI**:
        *   **Flink Web Dashboard**: Included with Flink.

### Research Findings

*   **Decision (Storage)**: We will use **PostgreSQL** for structured data like the audit trail and risk scores, and a **MinIO** (S3-compatible) object storage for unstructured data like documents and reports.
*   **Rationale**: This combination provides a robust and scalable solution. PostgreSQL is a mature and reliable database for transactional data, while MinIO is a popular open-source object storage solution that can be self-hosted, aligning with the BYOC principle.
*   **Alternatives considered**: ClickHouse was considered for its analytical performance, but PostgreSQL is deemed a better general-purpose choice for this stage of the project.

*   **Decision (Target Platform)**: The target platform will be **Kubernetes**.
*   **Rationale**: Kubernetes is the de-facto standard for container orchestration and is offered by all major cloud providers. This choice ensures cloud-agnosticism and portability.
*   **Alternatives considered**: We considered provider-specific solutions (like AWS ECS), but they would violate the BYOC principle.

*   **Decision (Dagger)**: Dagger will be used to create a local CI/CD pipeline and manage development services. The pipeline will be defined in a `dagger.json` file and will include steps for linting, testing, building, and running integration tests with dependent services (Kafka, Flink, UIs, etc.).
*   **Rationale**: Dagger provides a consistent and reproducible way to run CI pipelines and development services locally, which improves developer productivity and reduces integration issues.

*   **Decision (Confluent Local)**: `confluent local` will be used to run a single-node Kafka cluster for local development and testing. This will be integrated into the Dagger pipeline for integration tests.
*   **Rationale**: `confluent local` is a convenient way to run a local Kafka environment without the complexity of setting up a full cluster.

*   **Decision (CSV Ingestion)**: We will write a **custom Kafka producer in TypeScript** to read the CSV file and publish messages to a Kafka topic. A sample transaction fixture will be created from `transactions_mock_1000_for_participants.csv`.
*   **Rationale**: A custom producer provides more flexibility and control over the data ingestion process. It also avoids the overhead of setting up and configuring Kafka Connect for this simple use case.
*   **Alternatives considered**: Kafka Connect is a powerful tool for data ingestion, but it is more complex to set up and manage than a simple custom producer for this scenario.

*   **Decision (Stream Processing)**: We will use **Apache Flink** to process the transaction stream from Kafka. A Flink job will be written in Java/Scala to perform real-time analysis and generate alerts.
*   **Rationale**: Flink is a powerful stream processing framework that provides low-latency processing, stateful computations, and exactly-once semantics, which are all critical for this use case.
*   **Alternatives considered**: We considered using Kafka Streams, but Flink provides a more comprehensive set of features for complex event processing.

*   **Decision (Cloud Provisioning)**: We will use **Pulumi** to provision Confluent Cloud resources. A new `pulumi` package will be created to house the infrastructure code.
*   **Rationale**: Using Pulumi for cloud provisioning ensures that the infrastructure is managed as code, providing a single source of truth for the entire system's configuration.
*   **Alternatives considered**: We considered using Terraform, but Pulumi allows us to use a familiar programming language (TypeScript) to define our infrastructure.

*   **Decision (UIs)**: We will use the **Confluent Control Center** (included with `confluent local`) for monitoring Kafka, and the **Flink Web Dashboard** (included with Flink) for monitoring Flink. These will be managed by Dagger.
*   **Rationale**: Using the built-in UIs is the simplest and most straightforward approach for local development and testing.
*   **Alternatives considered**: AKHQ is a good alternative for Kafka, but the Control Center is sufficient for our needs.
