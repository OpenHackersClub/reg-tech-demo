import { Effect } from "effect";
import { HttpServer, HttpServerRouter, HttpServerResponse } from "@effect/platform";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../src/db";
import { alerts, auditTrail } from "../../src/db/schema";
import { AuditLogService } from "../services/auditlog.service";

const STATUS_VALUES = ["open", "in_progress", "closed"] as const;
type AlertStatus = (typeof STATUS_VALUES)[number];

const isAlertStatus = (v: unknown): v is AlertStatus =>
  typeof v === "string" && (STATUS_VALUES as readonly string[]).includes(v);

export const alertsController = HttpServerRouter.empty.pipe(
  HttpServerRouter.get(
    "/alerts",
    Effect.gen(function* (_) {
      const allAlerts = yield* _(Effect.promise(() => db.select().from(alerts).execute()));
      return HttpServerResponse.json(allAlerts);
    })
  ),
  HttpServerRouter.post(
    "/alerts/:id/status",
    Effect.gen(function* (_) {
      const request = yield* _(HttpServer.request.ServerRequest);
      const params = yield* _(HttpServerRouter.params);
      const audit = yield* _(AuditLogService);

      const alertId = params.id;
      const body = (yield* _(request.json)) as {
        status?: unknown;
        userId?: unknown;
        reason?: unknown;
      };

      if (!isAlertStatus(body.status)) {
        return HttpServerResponse.badRequest(
          `status must be one of: ${STATUS_VALUES.join(", ")}`,
        );
      }
      const newStatus: AlertStatus = body.status;
      const userId = typeof body.userId === "string" ? body.userId : null;
      const reason = typeof body.reason === "string" ? body.reason : null;

      const existing = yield* _(
        Effect.promise(() =>
          db.select().from(alerts).where(eq(alerts.id, alertId)).execute(),
        ),
      );
      const current = existing[0];
      if (!current) {
        return HttpServerResponse.json({ error: "alert not found" }, { status: 404 });
      }

      const oldStatus = current.status;

      yield* _(
        Effect.promise(() =>
          db
            .update(alerts)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(alerts.id, alertId))
            .execute(),
        ),
      );

      yield* _(
        audit.logAction({
          userId,
          action: "alert.status_change",
          entityType: "alert",
          entityId: alertId,
          details: { oldStatus, newStatus, reason },
        }),
      );

      return HttpServerResponse.json({ id: alertId, status: newStatus });
    }),
  ),
  HttpServerRouter.get(
    "/audit-log",
    Effect.gen(function* (_) {
      const request = yield* _(HttpServer.request.ServerRequest);
      const url = new URL(request.url, "http://internal");
      const entityType = url.searchParams.get("entityType");
      const entityId = url.searchParams.get("entityId");

      if (!entityType || !entityId) {
        return HttpServerResponse.badRequest(
          "entityType and entityId query params are required",
        );
      }

      const rows = yield* _(
        Effect.promise(() =>
          db
            .select()
            .from(auditTrail)
            .where(
              and(
                eq(auditTrail.entityType, entityType),
                eq(auditTrail.entityId, entityId),
              ),
            )
            .orderBy(desc(auditTrail.timestamp))
            .limit(100)
            .execute(),
        ),
      );

      return HttpServerResponse.json(rows);
    }),
  ),
);
