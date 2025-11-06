import { OpenAiClient } from '@effect/ai-openai';
import { NodeHttpClient } from '@effect/platform-node';
import { Config, Layer } from 'effect';
import { OpenAI } from 'openai';

import { env } from '@/config/env';

export const openAi = new OpenAI({
  apiKey: env.openaiApiKey,
  baseURL: env.openaiApiBaseUrl,
});

const OpenAi = OpenAiClient.layerConfig({
  apiKey: Config.redacted('OPENAI_API_KEY'),
  apiUrl: Config.string('OPENAI_API_BASE_URL'),
});

export const OpenAiWithHttp = Layer.provide(OpenAi, NodeHttpClient.layerUndici);
