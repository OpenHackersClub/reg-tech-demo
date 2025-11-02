import { AiToolkit } from "@effect/ai";
import { OpenAiClient } from "@effect/ai-openai";
import { Schema } from "@effect/schema";
import { Effect, Layer, Context } from "effect";
import type { OpenAIConfig } from "../config/openai.config.js";

// Schema for sanction check result
export class SanctionCheckResult extends Schema.Class<SanctionCheckResult>(
  "SanctionCheckResult"
)({
  entityName: Schema.String,
  isSanctioned: Schema.Boolean,
  confidence: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  ),
  matchedLists: Schema.Array(Schema.String),
  reasoning: Schema.String,
  recommendations: Schema.Array(Schema.String),
  checkedAt: Schema.DateTimeUtc,
}) {}

// Schema for sanction list information
export class SanctionListInfo extends Schema.Class<SanctionListInfo>(
  "SanctionListInfo"
)({
  listName: Schema.String,
  entityName: Schema.String,
  aliases: Schema.Array(Schema.String),
  reason: Schema.String,
  jurisdiction: Schema.String,
  listingDate: Schema.String,
}) {}

// Define the tools that the agent can use
const searchOFACSanctionsTool = AiToolkit.toolDef({
  name: "searchOFACSanctions",
  description:
    "Search the OFAC (Office of Foreign Assets Control) sanctions list for a given entity name. This includes SDN (Specially Designated Nationals) list.",
  input: Schema.Struct({
    entityName: Schema.String.pipe(
      Schema.description("The entity name to search for in OFAC sanctions")
    ),
  }),
  output: Schema.Array(SanctionListInfo),
  run: ({ entityName }) =>
    Effect.gen(function* () {
      // Simulated OFAC search - in production, this would call actual OFAC API
      // or search a local database of sanctions lists
      const normalizedName = entityName.toLowerCase();

      // Mock sanctioned entities for demonstration
      const mockSanctionedEntities = [
        {
          name: "abc holdings",
          aliases: ["abc corp", "abc ltd"],
          reason: "Terrorism financing",
          jurisdiction: "US",
          listingDate: "2023-05-15",
        },
        {
          name: "xyz bank",
          aliases: ["xyz financial", "xyz banking corp"],
          reason: "Money laundering activities",
          jurisdiction: "US",
          listingDate: "2022-11-20",
        },
        {
          name: "global trade llc",
          aliases: ["global trading", "gt international"],
          reason: "Sanctions evasion",
          jurisdiction: "US",
          listingDate: "2024-01-10",
        },
      ];

      const matches: SanctionListInfo[] = [];

      for (const entity of mockSanctionedEntities) {
        if (
          entity.name.includes(normalizedName) ||
          normalizedName.includes(entity.name) ||
          entity.aliases.some(
            (alias) =>
              alias.toLowerCase().includes(normalizedName) ||
              normalizedName.includes(alias.toLowerCase())
          )
        ) {
          matches.push(
            new SanctionListInfo({
              listName: "OFAC SDN List",
              entityName: entity.name,
              aliases: entity.aliases,
              reason: entity.reason,
              jurisdiction: entity.jurisdiction,
              listingDate: entity.listingDate,
            })
          );
        }
      }

      return matches;
    }),
});

const searchEUSanctionsTool = AiToolkit.toolDef({
  name: "searchEUSanctions",
  description:
    "Search the European Union sanctions list for a given entity name.",
  input: Schema.Struct({
    entityName: Schema.String.pipe(
      Schema.description("The entity name to search for in EU sanctions")
    ),
  }),
  output: Schema.Array(SanctionListInfo),
  run: ({ entityName }) =>
    Effect.gen(function* () {
      // Simulated EU sanctions search
      const normalizedName = entityName.toLowerCase();

      const mockEUSanctions = [
        {
          name: "eastern corp",
          aliases: ["eastern holdings", "ec group"],
          reason: "Supporting military aggression",
          jurisdiction: "EU",
          listingDate: "2023-03-01",
        },
        {
          name: "northern bank",
          aliases: ["nb financial", "northern banking"],
          reason: "Financing prohibited activities",
          jurisdiction: "EU",
          listingDate: "2023-06-15",
        },
      ];

      const matches: SanctionListInfo[] = [];

      for (const entity of mockEUSanctions) {
        if (
          entity.name.includes(normalizedName) ||
          normalizedName.includes(entity.name) ||
          entity.aliases.some(
            (alias) =>
              alias.toLowerCase().includes(normalizedName) ||
              normalizedName.includes(alias.toLowerCase())
          )
        ) {
          matches.push(
            new SanctionListInfo({
              listName: "EU Consolidated Sanctions List",
              entityName: entity.name,
              aliases: entity.aliases,
              reason: entity.reason,
              jurisdiction: entity.jurisdiction,
              listingDate: entity.listingDate,
            })
          );
        }
      }

      return matches;
    }),
});

const searchUNSanctionsTool = AiToolkit.toolDef({
  name: "searchUNSanctions",
  description:
    "Search the United Nations sanctions list for a given entity name.",
  input: Schema.Struct({
    entityName: Schema.String.pipe(
      Schema.description("The entity name to search for in UN sanctions")
    ),
  }),
  output: Schema.Array(SanctionListInfo),
  run: ({ entityName }) =>
    Effect.gen(function* () {
      // Simulated UN sanctions search
      const normalizedName = entityName.toLowerCase();

      const mockUNSanctions = [
        {
          name: "pacific trading",
          aliases: ["pacific trade co", "pt international"],
          reason: "Violating UN Security Council resolutions",
          jurisdiction: "UN",
          listingDate: "2023-08-22",
        },
      ];

      const matches: SanctionListInfo[] = [];

      for (const entity of mockUNSanctions) {
        if (
          entity.name.includes(normalizedName) ||
          normalizedName.includes(entity.name) ||
          entity.aliases.some(
            (alias) =>
              alias.toLowerCase().includes(normalizedName) ||
              normalizedName.includes(alias.toLowerCase())
          )
        ) {
          matches.push(
            new SanctionListInfo({
              listName: "UN Sanctions List",
              entityName: entity.name,
              aliases: entity.aliases,
              reason: entity.reason,
              jurisdiction: entity.jurisdiction,
              listingDate: entity.listingDate,
            })
          );
        }
      }

      return matches;
    }),
});

// Create the toolkit with all sanction checking tools
const sanctionToolkit = AiToolkit.make(
  searchOFACSanctionsTool,
  searchEUSanctionsTool,
  searchUNSanctionsTool
);

// Service interface
export interface SanctionCheckService {
  checkEntity: (entityName: string) => Effect.Effect<SanctionCheckResult>;
}

export const SanctionCheckService = Context.GenericTag<SanctionCheckService>(
  "@reg-tech-demo/SanctionCheckService"
);

// System prompt for the AML agent
const SYSTEM_PROMPT = `You are an expert AML (Anti-Money Laundering) compliance agent specializing in sanctions screening.

Your role is to:
1. Thoroughly search all available sanctions lists (OFAC, EU, UN) for the given entity name
2. Check for exact matches, partial matches, and similar names (including common aliases)
3. Analyze the search results to determine if the entity is sanctioned
4. Provide a confidence score (0.0 to 1.0) based on the quality of the match
5. List all matched sanction lists
6. Provide clear reasoning for your determination
7. Offer actionable recommendations for compliance officers

Be thorough and conservative in your assessment. When in doubt, recommend further investigation.
Use all available tools to search comprehensively across different sanctions lists.`;

// Service implementation
const makeSanctionCheckService = Effect.gen(function* () {
  const config = yield* Effect.config(
    Schema.Struct({
      apiKey: Schema.String,
      model: Schema.String,
    })
  );

  const openaiClient = yield* OpenAiClient.make({
    apiKey: config.apiKey,
  });

  const agent = openaiClient.agent({
    model: config.model,
    system: SYSTEM_PROMPT,
    tools: sanctionToolkit,
    maxSteps: 5, // Allow multiple tool calls for thorough checking
  });

  const checkEntity = (
    entityName: string
  ): Effect.Effect<SanctionCheckResult> =>
    Effect.gen(function* () {
      const prompt = `
Please conduct a comprehensive sanctions screening for the following entity:

Entity Name: "${entityName}"

Instructions:
1. Search ALL available sanctions lists (OFAC, EU, UN)
2. Check for exact matches, partial matches, and potential aliases
3. Analyze all findings comprehensively
4. Provide your assessment in the following JSON format:

{
  "entityName": "${entityName}",
  "isSanctioned": <boolean>,
  "confidence": <number between 0 and 1>,
  "matchedLists": [<array of matched sanction list names>],
  "reasoning": "<detailed explanation of your assessment>",
  "recommendations": [<array of recommended actions for compliance officers>]
}

Be thorough and provide a well-reasoned assessment.`;

      const response = yield* agent(prompt);

      // Parse the agent's response
      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // If no structured response, create a default one
          return new SanctionCheckResult({
            entityName,
            isSanctioned: false,
            confidence: 0.5,
            matchedLists: [],
            reasoning: response,
            recommendations: [
              "Review the agent's response manually",
              "Consider additional screening measures",
            ],
            checkedAt: new Date(),
          });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return new SanctionCheckResult({
          entityName: parsed.entityName || entityName,
          isSanctioned: parsed.isSanctioned || false,
          confidence: parsed.confidence || 0.0,
          matchedLists: parsed.matchedLists || [],
          reasoning: parsed.reasoning || response,
          recommendations: parsed.recommendations || [],
          checkedAt: new Date(),
        });
      } catch (error) {
        // Fallback if parsing fails
        const containsSanctionedKeywords =
          response.toLowerCase().includes("sanctioned") ||
          response.toLowerCase().includes("match found");

        return new SanctionCheckResult({
          entityName,
          isSanctioned: containsSanctionedKeywords,
          confidence: containsSanctionedKeywords ? 0.7 : 0.3,
          matchedLists: [],
          reasoning: response,
          recommendations: [
            "Manual review recommended due to parsing error",
            "Verify the agent's findings",
          ],
          checkedAt: new Date(),
        });
      }
    });

  return {
    checkEntity,
  } satisfies SanctionCheckService;
});

// Export the service layer
export const SanctionCheckServiceLive = Layer.effect(
  SanctionCheckService,
  makeSanctionCheckService
);
