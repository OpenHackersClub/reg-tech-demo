import { OpenAI } from 'openai';

import { env } from '@/config/env.js';

export const openAi = new OpenAI({
  apiKey: env.openaiApiKey,
  baseURL: env.openaiApiBaseUrl,
});
