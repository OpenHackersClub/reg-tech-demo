import { Effect, Console } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { HttpServer, HttpServerRouter } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { alertsController } from "./controllers/alerts.controller";
import { documentsController } from "./controllers/documents.controller";

const app = HttpServerRouter.empty.pipe(
  alertsController,
  documentsController
);

const server = HttpServer.serve(app, { port: 3000 }).pipe(
  Effect.tap(() => Console.log("Server listening on http://localhost:3000")),
  Effect.scoped // Ensures resources are properly managed
);

NodeRuntime.runMain(server);