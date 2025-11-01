import { Effect } from "effect";
import { HttpServer, HttpServerRouter, HttpServerResponse } from "@effect/platform";
import { db } from "../../src/db";
import { alerts } from "../../src/db/schema";

export const alertsController = HttpServerRouter.empty.pipe(
  HttpServerRouter.get(
    "/alerts",
    Effect.gen(function* (_) {
      const allAlerts = yield* _(Effect.promise(() => db.select().from(alerts).execute()));
      return HttpServerResponse.json(allAlerts);
    })
  )
);
