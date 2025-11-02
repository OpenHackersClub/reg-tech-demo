import { Config, Effect } from "effect";

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const OPENAI_API_KEY = Config.string("OPENAI_API_KEY");
export const OPENAI_MODEL = Config.withDefault(
  Config.string("OPENAI_MODEL"),
  "gpt-4-turbo-preview"
);
export const OPENAI_MAX_TOKENS = Config.withDefault(
  Config.number("OPENAI_MAX_TOKENS"),
  2000
);
export const OPENAI_TEMPERATURE = Config.withDefault(
  Config.number("OPENAI_TEMPERATURE"),
  0.1
);

export const OpenAIConfigLive = Effect.gen(function* () {
  const apiKey = yield* OPENAI_API_KEY;
  const model = yield* OPENAI_MODEL;
  const maxTokens = yield* OPENAI_MAX_TOKENS;
  const temperature = yield* OPENAI_TEMPERATURE;

  return {
    apiKey,
    model,
    maxTokens,
    temperature,
  } satisfies OpenAIConfig;
});
