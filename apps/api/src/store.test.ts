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
