import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const app = createApp();

async function startServer() {
  try {
    // Verify database connectivity
    const client = await pool.connect();
    console.log('⚡ Connected to PostgreSQL (Neon) successfully');
    client.release();
  } catch (err: any) {
    console.warn('⚠️ Warning: Initial PostgreSQL connection attempt failed:', err.message);
    console.warn('Ensure your DATABASE_URL in .env is configured with valid Neon credentials.');
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Campus Event Hub Backend running on http://localhost:${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔒 Session Auth via HttpOnly cookie enabled (Cookie name: ${env.COOKIE_NAME})`);
  });
}

startServer();
