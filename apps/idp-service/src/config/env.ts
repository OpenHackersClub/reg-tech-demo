import { config } from '@dotenvx/dotenvx';

config();

export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiApiBaseUrl: process.env.OPENAI_API_BASE_URL,
} as const;
