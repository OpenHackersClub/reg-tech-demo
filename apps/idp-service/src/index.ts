import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { env } from '@/config/env';

import { documentRoute } from './modules/document/route';

const app = new Hono();

app.use(logger());
app.use(cors());

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

// // Error handler
// app.onError((err, c) => {
//   if (err instanceof HTTPException) {
//     return c.json({ error: err.message }, err.status);
//   }

//   console.error('Unhandled error:', err);
//   return c.json({ error: 'Internal Server Error', details: err }, 500);
// });

// export default app;
