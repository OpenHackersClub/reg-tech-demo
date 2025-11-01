# Quickstart: AI Compliance Agent System

This guide provides instructions for setting up and running the AI Compliance Agent System for local development and testing.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or later)
*   [pnpm](https://pnpm.io/)
*   [Docker](https://www.docker.com/)
*   [Confluent CLI](https://docs.confluent.io/confluent-cli/current/install.html)
*   [Dagger](https://dagger.io/)

## Setup

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd reg-tech-demo
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Start local infrastructure**:

    This command will start a local Kafka instance using `confluent local`.

    ```bash
    confluent local start
    ```

## Running the Application

1.  **Run the web application**:

    ```bash
    pnpm --filter web dev
    ```

    The application will be available at `http://localhost:3000`.

## Local CI/CD with Dagger

You can run the entire CI/CD pipeline locally using Dagger. This will lint, test, and build the application in a containerized environment.

```bash
dagger call -m ./dagger ci
```