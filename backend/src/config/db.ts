import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// For Neon and cloud PostgreSQL, enable SSL unless localhost
const isLocal = env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    // Optional debug log
    // console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}
