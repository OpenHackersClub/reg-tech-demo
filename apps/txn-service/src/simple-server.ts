import http from 'http';
import { db } from './db';
import { alerts, clientDocuments } from './db/schema';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    if (req.url === '/alerts' && req.method === 'GET') {
      const allAlerts = await db.select().from(alerts).execute();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allAlerts));
    } else if (req.url === '/documents' && req.method === 'GET') {
      const allDocuments = await db.select().from(clientDocuments).execute();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allDocuments));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: (error as Error).message }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
