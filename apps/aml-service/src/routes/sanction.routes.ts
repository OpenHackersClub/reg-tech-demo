import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform";
import { Effect, Schema } from "effect";
import { SanctionCheckService } from "../services/sanction.service.js";

// Request schemas
const CheckEntityRequest = Schema.Struct({
  entityName: Schema.String,
});

const BatchCheckRequest = Schema.Struct({
  entities: Schema.Array(Schema.String),
});

// Create the router
export const sanctionRouter = HttpRouter.empty.pipe(
  // Health check endpoint
  HttpRouter.get(
    "/health",
    Effect.gen(function* () {
      return yield* HttpServerResponse.json({
        status: "healthy",
        service: "aml-service",
        timestamp: new Date().toISOString(),
      });
    })
  ),

  // Check single entity endpoint
  HttpRouter.post(
    "/check",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = yield* request.json;

      // Validate request body
      const validated = yield* Schema.decodeUnknown(CheckEntityRequest)(body);

      // Get the sanction check service
      const service = yield* SanctionCheckService;

      // Run the sanction check
      const result = yield* service.checkEntity(validated.entityName);

      return yield* HttpServerResponse.json({
        success: true,
        data: result,
      });
    }).pipe(
      Effect.catchTags({
        ParseError: (error) =>
          HttpServerResponse.json(
            {
              error: "Invalid request",
              message: "entityName is required and must be a string",
              details: error.message,
            },
            { status: 400 }
          ),
        RequestError: (error) =>
          HttpServerResponse.json(
            {
              error: "Request error",
              message: error.message,
            },
            { status: 400 }
          ),
      }),
      Effect.catchAll((error) =>
        HttpServerResponse.json(
          {
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        )
      )
    )
  ),

  // Batch check endpoint
  HttpRouter.post(
    "/check/batch",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = yield* request.json;

      // Validate request body
      const validated = yield* Schema.decodeUnknown(BatchCheckRequest)(body);

      // Get the sanction check service
      const service = yield* SanctionCheckService;

      // Run all checks in parallel using Effect.all
      const results = yield* Effect.all(
        validated.entities.map((entityName) =>
          service.checkEntity(entityName)
        ),
        { concurrency: 5 } // Limit concurrency to 5 parallel requests
      );

      const sanctionedCount = results.filter((r) => r.isSanctioned).length;

      return yield* HttpServerResponse.json({
        success: true,
        data: results,
        summary: {
          total: results.length,
          sanctioned: sanctionedCount,
          cleared: results.length - sanctionedCount,
        },
      });
    }).pipe(
      Effect.catchTags({
        ParseError: (error) =>
          HttpServerResponse.json(
            {
              error: "Invalid request",
              message: "entities must be an array of strings",
              details: error.message,
            },
            { status: 400 }
          ),
        RequestError: (error) =>
          HttpServerResponse.json(
            {
              error: "Request error",
              message: error.message,
            },
            { status: 400 }
          ),
      }),
      Effect.catchAll((error) =>
        HttpServerResponse.json(
          {
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        )
      )
    )
  ),

  // Get entity check history (placeholder)
  HttpRouter.get(
    "/history/:entityName",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const params = request.params as Record<string, string>;
      const entityName = params.entityName;

      return yield* HttpServerResponse.json({
        message: "History feature coming soon",
        entityName,
        checks: [],
      });
    })
  )
);
