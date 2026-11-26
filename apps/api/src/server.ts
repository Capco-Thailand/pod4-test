import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { buildApp } from './app.js';
import { createStore, passwordHash } from './store.js';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgres://endorsement:endorsement@localhost:5432/endorsement',
});
const schema = await readFile(
  fileURLToPath(new URL('../src/schema.sql', import.meta.url)),
  'utf8',
);
await pool.query(schema);
if (process.env.SEED_DEMO === 'true') {
  const salt = 'fr01-synthetic-salt';
  const digest = `${salt}:${passwordHash('demo-password', salt)}`;
  await pool.query(
    'INSERT INTO customers (id, email, password_hash) VALUES ($1, $2, $3), ($4, $5, $6) ON CONFLICT (id) DO NOTHING',
    [
      '00000000-0000-4000-8000-000000000001',
      'owner@example.test',
      digest,
      '00000000-0000-4000-8000-000000000002',
      'other@example.test',
      digest,
    ],
  );
  await pool.query(
    'INSERT INTO policies (id, owner_id, number, status, coverage) VALUES ($1,$2,$3,$4,$5),($6,$7,$8,$9,$10),($11,$12,$13,$14,$15) ON CONFLICT (id) DO NOTHING',
    [
      '00000000-0000-4000-8000-000000000011',
      '00000000-0000-4000-8000-000000000001',
      'DEMO-001',
      'ACTIVE',
      'THB 1,000,000',
      '00000000-0000-4000-8000-000000000012',
      '00000000-0000-4000-8000-000000000001',
      'DEMO-002',
      'EXPIRED',
      'THB 500,000',
      '00000000-0000-4000-8000-000000000013',
      '00000000-0000-4000-8000-000000000002',
      'DEMO-003',
      'ACTIVE',
      'THB 750,000',
    ],
  );
}
const app = await buildApp(createStore(pool));
await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
