import { Effect, Context, Layer, Schema } from "effect";
import { db } from "../db";
import { auditTrail } from "../db/schema";

/**
 * Tagged error for audit-log persistence failures.
 * The underlying cause is preserved as `Unknown` so callers can re-pretty-print it
 * via `Cause.pretty` without losing the original stack.
 */
export class AuditLogDbError extends Schema.TaggedError<AuditLogDbError>()(
  "AuditLogDbError",
  { cause: Schema.Unknown },
) {}

export interface LogActionInput {
  readonly userId?: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly details?: Record<string, unknown> | null;
}

export class AuditLogService extends Context.Tag("AuditLogService")<
  AuditLogService,
  {
    readonly logAction: (
      input: LogActionInput,
    ) => Effect.Effect<void, AuditLogDbError>;
  }
>() {}

export const makeAuditLogService = Effect.sync(() => {
  const logAction = (input: LogActionInput) =>
    Effect.tryPromise({
      try: () =>
        db
          .insert(auditTrail)
          .values({
            userId: input.userId ?? null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            details: input.details ?? null,
          })
          .execute(),
      catch: (cause) => new AuditLogDbError({ cause }),
    }).pipe(Effect.asVoid);

  return { logAction } as const;
});

export const AuditLogServiceLive = Layer.effect(
  AuditLogService,
  makeAuditLogService,
);
