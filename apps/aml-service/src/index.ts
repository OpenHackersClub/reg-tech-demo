import {
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer, Config } from "effect";
import { sanctionRouter } from "./routes/sanction.routes.js";
import { SanctionCheckServiceLive } from "./services/sanction.service.js";

// Server configuration
const PORT = Config.withDefault(Config.number("PORT"), 3001);
const HOST = Config.withDefault(Config.string("HOST"), "0.0.0.0");

// Create the main router with all routes
const router = HttpRouter.empty.pipe(
  // Root endpoint
  HttpRouter.get(
    "/",
    Effect.gen(function* () {
      return yield* HttpServerResponse.json({
        service: "AML Sanction Checking Service",
        version: "1.0.0",
        description:
          "AI-powered sanctions screening using agentic approach with OpenAI",
        endpoints: {
          health: "GET /api/sanction/health",
          check: "POST /api/sanction/check",
          batchCheck: "POST /api/sanction/check/batch",
          history: "GET /api/sanction/history/:entityName",
        },
        documentation: "See README.md for usage instructions",
      });
    }),
  ),
  // Mount sanction routes under /api/sanction
  HttpRouter.mountApp("/api/sanction", sanctionRouter),
);

// CORS middleware
const corsMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const response = yield* app;
    return response.pipe(
      HttpServerResponse.setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }),
    );
  }),
);

// Logging middleware
const loggingMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* Option(HttpServer.request.HttpServerRequest);

    if (request._tag === "Some") {
      const req = request.value;
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }

    const response = yield* app;
    return response;
  }),
);

// Create the HTTP application with middleware
const app = router.pipe(
  HttpRouter.use(loggingMiddleware),
  HttpRouter.use(corsMiddleware),
);

// Main server program
const program = Effect.gen(function* () {
  const port = yield* PORT;
  const host = yield* HOST;

  console.log(`🚀 AML Service starting...`);
  console.log(`📍 Server running at http://${host}:${port}`);
  console.log(`🔍 Sanction checking endpoint: POST /api/sanction/check`);
  console.log(`📦 Batch checking endpoint: POST /api/sanction/check/batch`);
  console.log(`\n✅ Press Ctrl+C to stop\n`);

  yield* HttpServer.serve(app);
});

// Create the server layer
const ServerLive = NodeHttpServer.layer(() =>
  Effect.gen(function* () {
    const port = yield* PORT;
    const host = yield* HOST;
    return { port, host };
  }),
);

// Combine all layers
const MainLive = Layer.mergeAll(SanctionCheckServiceLive, ServerLive);

// Run the program
NodeRuntime.runMain(program.pipe(Effect.provide(MainLive)));
