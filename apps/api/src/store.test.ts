import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStore } from './store.js';

test('FR-01 request and audit use one transaction and leave policy untouched', async () => {
  const statements: string[] = [];
  const client = {
    query: async (sql: string) => {
      statements.push(sql);
      return {
        rows: sql.includes('INSERT INTO beneficiary_requests')
          ? [{ id: 'request-1' }]
          : [],
      };
    },
    release: () => {},
  };
  const store = createStore({ connect: async () => client } as never);
  assert.equal(
    await store.createRequest('owner-1', 'policy-1', 'Mali', 'Sister'),
    'request-1',
  );
  assert.deepEqual(
    statements.map((sql) => sql.split(' ')[0]),
    ['BEGIN', 'INSERT', 'INSERT', 'COMMIT'],
  );
  assert.match(statements[2], /audit_events/);
  assert.ok(statements.every((sql) => !/UPDATE policies/i.test(sql)));
});

test('FR-01 audit failure rolls back the request', async () => {
  const statements: string[] = [];
  const client = {
    query: async (sql: string) => {
      statements.push(sql);
      if (sql.includes('audit_events')) throw new Error('audit unavailable');
      return { rows: [{ id: 'request-1' }] };
    },
    release: () => {},
  };
  const store = createStore({ connect: async () => client } as never);
  await assert.rejects(
    store.createRequest('owner-1', 'policy-1', 'Mali', 'Sister'),
    /audit unavailable/,
  );
  assert.equal(statements.at(-1), 'ROLLBACK');
  assert.ok(!statements.includes('COMMIT'));
});

test('FR-01 session creation and successful sign-in audit commit together', async () => {
  const statements: string[] = [];
  const client = {
    query: async (sql: string) => {
      statements.push(sql);
      return { rows: [] };
    },
    release: () => {},
  };
  const store = createStore({
    connect: async () => client,
    query: async (sql: string) => {
      statements.push(sql);
      return { rows: [] };
    },
  } as never);
  await store.createSession('owner-1');
  assert.deepEqual(
    statements.map((sql) => sql.split(' ')[0]),
    ['BEGIN', 'INSERT', 'INSERT', 'COMMIT'],
  );
  assert.match(statements[2], /audit_events/);
  assert.ok(
    statements.every(
      (sql) => !/opaque-token|csrf-token|demo-password/.test(sql),
    ),
  );
});

test('FR-01 sign-in audit failure rolls back the session', async () => {
  const statements: string[] = [];
  const client = {
    query: async (sql: string) => {
      statements.push(sql);
      if (sql.includes('audit_events')) throw new Error('audit unavailable');
      return { rows: [] };
    },
    release: () => {},
  };
  const store = createStore({ connect: async () => client } as never);
  await assert.rejects(store.createSession('owner-1'), /audit unavailable/);
  assert.equal(statements.at(-1), 'ROLLBACK');
  assert.ok(!statements.includes('COMMIT'));
});

test('FR-02 sign-out revocation and minimal audit commit together', async () => {
  const statements: Array<{ sql: string; params?: unknown[] }> = [];
  const client = {
    query: async (sql: string, params?: unknown[]) => {
      statements.push({ sql, params });
      return { rows: [] };
    },
    release: () => {},
  };
  const store = createStore({ connect: async () => client } as never);
  await store.revokeSession('opaque-token', 'owner-1');
  assert.deepEqual(
    statements.map(({ sql }) => sql.split(' ')[0]),
    ['BEGIN', 'DELETE', 'INSERT', 'COMMIT'],
  );
  assert.match(statements[1].sql, /token_hash = \$1 AND actor_id = \$2/);
  assert.equal(statements[1].params?.[1], 'owner-1');
  assert.deepEqual(statements[2].params?.slice(1), [
    'owner-1',
    'SIGN_OUT',
    'SUCCESS',
  ]);
  assert.ok(
    statements.every(({ sql }) => !/UPDATE policies|UPDATE coverage/.test(sql)),
  );
  assert.ok(
    statements
      .flatMap(({ params }) => params ?? [])
      .every((value) => value !== 'opaque-token'),
  );
});

test('FR-02 request reads enforce both request actor and policy owner in SQL', async () => {
  const queries: Array<{ sql: string; params: unknown[] }> = [];
  const store = createStore({
    query: async (sql: string, params: unknown[]) => {
      queries.push({ sql, params });
      return { rows: [] };
    },
  } as never);
  assert.deepEqual(await store.requests('owner-1'), []);
  assert.equal(await store.request('owner-1', 'request-1'), null);
  assert.match(queries[0].sql, /r.actor_id = \$1 AND p.owner_id = \$1/);
  assert.match(
    queries[1].sql,
    /r.id = \$1 AND r.actor_id = \$2 AND p.owner_id = \$2/,
  );
  assert.deepEqual(queries[1].params, ['request-1', 'owner-1']);
});
