import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('--- Starting Database Migrations ---');
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const migrationFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationFile, 'utf8');

      console.log(`Executing migration: ${file}...`);
      await client.query(sql);
      console.log(`✅ ${file} applied successfully!`);
    }
    console.log('🎉 All migrations applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
