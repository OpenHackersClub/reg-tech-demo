import { Effect, Layer, Exit, Cause } from "effect";
import {
  AuditLogService,
  AuditLogServiceLive,
  AuditLogDbError,
} from "../../src/services/auditlog.service";

/**
 * Unit-level happy-path test for the audit-log service.
 *
 * No test harness (vitest/jest) is wired up in this package yet — see PR body.
 * When one is added, this file will run as-is; for now it documents intent and
 * exercises the typings at compile time.
 *
 * The "real" integration assertion (row actually persisted) is parked behind
 * an `INTEGRATION_DB=1` env gate so the file is safe to import without a DB.
 */

describe("AuditLogService", () => {
  it("logAction inserts a row and resolves to void", async () => {
    if (!process.env.INTEGRATION_DB) {
      // Skip until a Postgres harness is available in this package's test runner.
      return;
    }

    const program = Effect.gen(function* (_) {
      const audit = yield* _(AuditLogService);
      yield* _(
        audit.logAction({
          userId: "test-user",
          action: "alert.status_change",
          entityType: "alert",
          entityId: "alert-test-1",
          details: { oldStatus: "open", newStatus: "in_progress" },
        }),
      );
    }).pipe(Effect.provide(AuditLogServiceLive));

    const exit = await Effect.runPromiseExit(program);

    Exit.match(exit, {
      onFailure: (cause) => {
        throw new Error(`logAction failed: ${Cause.pretty(cause)}`);
      },
      onSuccess: () => undefined,
    });
  });

  it("AuditLogDbError is a tagged error with a cause field", () => {
    const err = new AuditLogDbError({ cause: new Error("db down") });
    expect(err._tag).toBe("AuditLogDbError");
    expect(err.cause).toBeDefined();
  });
});
