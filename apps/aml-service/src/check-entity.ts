import { Effect } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import {
  SanctionCheckService,
  SanctionCheckServiceLive,
} from "./services/sanction.service.js";

// CLI program for checking a single entity
const program = Effect.gen(function* () {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npm run check:entity -- <entity-name>");
    console.log('Example: npm run check:entity -- "ABC Holdings"');
    return yield* Effect.fail(new Error("No entity name provided"));
  }

  const entityName = args.join(" ");

  console.log(`\n🔍 Checking sanctions for: "${entityName}"\n`);
  console.log("⏳ Running comprehensive sanctions screening...\n");

  const service = yield* SanctionCheckService;
  const result = yield* service.checkEntity(entityName);

  console.log("═══════════════════════════════════════════════════════");
  console.log("                 SANCTION CHECK RESULT                 ");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`Entity Name:        ${result.entityName}`);
  console.log(
    `Status:             ${result.isSanctioned ? "⚠️  SANCTIONED" : "✅ CLEARED"}`
  );
  console.log(`Confidence:         ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Checked At:         ${result.checkedAt.toISOString()}`);
  console.log("───────────────────────────────────────────────────────");

  if (result.matchedLists.length > 0) {
    console.log(`\n📋 Matched Lists (${result.matchedLists.length}):`);
    result.matchedLists.forEach((list, idx) => {
      console.log(`   ${idx + 1}. ${list}`);
    });
  } else {
    console.log("\n📋 Matched Lists: None");
  }

  console.log(`\n💭 Reasoning:\n${result.reasoning}`);

  if (result.recommendations.length > 0) {
    console.log(`\n📝 Recommendations (${result.recommendations.length}):`);
    result.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
  }

  console.log("\n═══════════════════════════════════════════════════════\n");

  return result;
});

// Run the program with the service layer
NodeRuntime.runMain(program.pipe(Effect.provide(SanctionCheckServiceLive)));
