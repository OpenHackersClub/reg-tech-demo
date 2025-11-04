import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { env } from '@/config/env.js';

import { documentRoute } from './modules/document/route.js';

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    env: {
      openaiApiKey: env.openaiApiKey,
      openaiApiBaseUrl: env.openaiApiBaseUrl,
    },
  });
});

app.route('/document', documentRoute);

const server = serve(
  {
    fetch: app.fetch,
    port: 8002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

// graceful shutdown
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
