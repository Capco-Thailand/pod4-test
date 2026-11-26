import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from './app.js';

test('FR-01 sign-in creates a cookie-backed session and exposes only owned policies', async () => {
  const app = await buildApp({
    audit: async () => {},
    signIn: async (email, password) =>
      email === 'owner@example.test' && password === 'demo-password'
        ? { id: 'owner-1' }
        : null,
    createSession: async () => ({ token: 'opaque-token', csrf: 'csrf-token' }),
    session: async (token) =>
      token === 'opaque-token' ? { actorId: 'owner-1' } : null,
    policies: async () => [
      {
        id: 'policy-1',
        number: 'DEMO-001',
        status: 'ACTIVE',
        coverage: 'THB 1,000,000',
      },
    ],
    policy: async (_actor, id) =>
      id === 'policy-1'
        ? {
            id,
            number: 'DEMO-001',
            status: 'ACTIVE',
            coverage: 'THB 1,000,000',
          }
        : null,
    createRequest: async () => 'request-1',
  });
  const login = await app.inject({
    method: 'POST',
    url: '/api/v1/session',
    payload: { email: 'owner@example.test', password: 'demo-password' },
  });
  assert.equal(login.statusCode, 200);
  assert.match(login.headers['set-cookie'] as string, /HttpOnly/);
  const cookie = (login.headers['set-cookie'] as string).split(';')[0];
  const owned = await app.inject({
    method: 'GET',
    url: '/api/v1/policies/policy-1',
    headers: { cookie },
  });
  assert.equal(owned.statusCode, 200);
  assert.equal(owned.json().number, 'DEMO-001');
  const foreign = await app.inject({
    method: 'GET',
    url: '/api/v1/policies/foreign',
    headers: { cookie },
  });
  assert.equal(foreign.statusCode, 404);
  const anonymous = await app.inject({
    method: 'GET',
    url: '/api/v1/policies/policy-1',
  });
  assert.equal(anonymous.statusCode, 401);
  await app.close();
});

test('FR-01 session cookie is Secure behind HTTPS proxy', async () => {
  const app = await buildApp({
    audit: async () => {},
    signIn: async () => ({ id: 'owner-1' }),
    createSession: async () => ({ token: 'opaque-token', csrf: 'csrf-token' }),
    session: async () => null,
    policies: async () => [],
    policy: async () => null,
    createRequest: async () => 'request-1',
  });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/session',
    headers: { 'x-forwarded-proto': 'https' },
    payload: { email: 'owner@example.test', password: 'demo-password' },
  });
  assert.match(response.headers['set-cookie'] as string, /Secure/);
  await app.close();
});

test('FR-01 request creation requires owner, ACTIVE status, valid fields, and CSRF', async () => {
  const created: string[] = [];
  const app = await buildApp({
    audit: async () => {},
    signIn: async () => ({ id: 'owner-1' }),
    createSession: async () => ({ token: 'opaque-token', csrf: 'csrf-token' }),
    session: async (token) =>
      token === 'opaque-token'
        ? { actorId: 'owner-1', csrf: 'csrf-token' }
        : null,
    policies: async () => [],
    policy: async (_actor, id) =>
      id === 'active'
        ? {
            id,
            number: 'DEMO-001',
            status: 'ACTIVE',
            coverage: 'THB 1,000,000',
          }
        : id === 'expired'
          ? {
              id,
              number: 'DEMO-002',
              status: 'EXPIRED',
              coverage: 'THB 500,000',
            }
          : null,
    createRequest: async (_actor, _policy, name, relationship) => {
      created.push(`${name}:${relationship}`);
      return 'request-1';
    },
  });
  const cookie = 'session=opaque-token';
  const submit = (
    policyId: string,
    body: object,
    csrf?: string,
    authenticated = true,
  ) =>
    app.inject({
      method: 'POST',
      url: `/api/v1/policies/${policyId}/beneficiary-requests`,
      headers: {
        ...(authenticated ? { cookie } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
      },
      payload: body,
    });
  assert.equal(
    (
      await submit(
        'active',
        { name: '  Mali  ', relationship: ' Sister ' },
        'csrf-token',
      )
    ).statusCode,
    201,
  );
  assert.deepEqual(created, ['Mali:Sister']);
  assert.equal(
    (
      await submit(
        'foreign',
        { name: 'Mali', relationship: 'Sister' },
        'csrf-token',
      )
    ).statusCode,
    404,
  );
  assert.equal(
    (
      await submit(
        'expired',
        { name: 'Mali', relationship: 'Sister' },
        'csrf-token',
      )
    ).statusCode,
    409,
  );
  assert.equal(
    (
      await submit(
        'active',
        { name: '  ', relationship: 'Sister' },
        'csrf-token',
      )
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await submit(
        'active',
        { name: 'x'.repeat(121), relationship: 'Sister' },
        'csrf-token',
      )
    ).statusCode,
    400,
  );
  assert.equal(
    (await submit('active', { name: 'Mali', relationship: 'Sister' }))
      .statusCode,
    403,
  );
  assert.equal(
    (await submit('active', { name: 'Mali', relationship: 'Sister' }, 'bad'))
      .statusCode,
    403,
  );
  assert.equal(
    (
      await submit(
        'active',
        { name: 'Mali', relationship: 'Sister' },
        'csrf-token',
        false,
      )
    ).statusCode,
    401,
  );
  assert.deepEqual(created, ['Mali:Sister']);
  await app.close();
});

test('FR-01 sign-in and rejected protected actions append minimal audit events', async () => {
  const events: Array<{
    actorId: string | null;
    policyId: string | null;
    action: string;
    outcome: string;
  }> = [];
  const app = await buildApp({
    audit: async (event) => {
      events.push(event);
    },
    signIn: async (email) =>
      email === 'owner@example.test' ? { id: 'owner-1' } : null,
    createSession: async () => ({ token: 'opaque-token', csrf: 'csrf-token' }),
    session: async (token) =>
      token === 'opaque-token'
        ? { actorId: 'owner-1', csrf: 'csrf-token' }
        : null,
    policies: async () => [],
    policy: async (_actor, id) =>
      id === 'active'
        ? {
            id,
            number: 'DEMO-001',
            status: 'ACTIVE',
            coverage: 'THB 1,000,000',
          }
        : null,
    createRequest: async () => 'request-1',
  });
  await app.inject({
    method: 'POST',
    url: '/api/v1/session',
    payload: { email: 'bad@example.test', password: 'wrong' },
  });
  await app.inject({ method: 'GET', url: '/api/v1/policies/active' });
  await app.inject({
    method: 'GET',
    url: '/api/v1/policies/foreign',
    headers: { cookie: 'session=opaque-token' },
  });
  await app.inject({
    method: 'POST',
    url: '/api/v1/policies/active/beneficiary-requests',
    headers: { cookie: 'session=opaque-token' },
    payload: { name: 'Mali', relationship: 'Sister' },
  });
  assert.deepEqual(events, [
    {
      actorId: null,
      policyId: null,
      action: 'SIGN_IN',
      outcome: 'INVALID_CREDENTIALS',
    },
    {
      actorId: null,
      policyId: null,
      action: 'POLICY_READ',
      outcome: 'UNAUTHENTICATED',
    },
    {
      actorId: 'owner-1',
      policyId: null,
      action: 'POLICY_READ',
      outcome: 'POLICY_NOT_FOUND',
    },
    {
      actorId: 'owner-1',
      policyId: 'active',
      action: 'BENEFICIARY_REQUEST_CREATE',
      outcome: 'CSRF_INVALID',
    },
  ]);
  await app.close();
});
