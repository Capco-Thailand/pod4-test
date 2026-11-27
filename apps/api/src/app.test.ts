import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from './app.js';

test('FR-02 session restores CSRF and sign-out revokes the cookie session', async () => {
  let active = true;
  const events: string[] = [];
  const app = await buildApp({
    audit: async (event) => {
      events.push(`${event.action}:${event.outcome}`);
    },
    signIn: async () => ({ id: 'owner-1' }),
    createSession: async () => ({ token: 'opaque-token', csrf: 'csrf-token' }),
    session: async (token) =>
      active && token === 'opaque-token'
        ? { actorId: 'owner-1', csrf: 'csrf-token' }
        : null,
    revokeSession: async () => {
      active = false;
    },
    policies: async () => [],
    policy: async () => null,
    requests: async () => [],
    request: async () => null,
    createRequest: async () => 'request-1',
  });
  const cookie = 'session=opaque-token';
  const restored = await app.inject({
    method: 'GET',
    url: '/api/v1/session',
    headers: { cookie },
  });
  assert.equal(restored.statusCode, 200);
  assert.equal(restored.json().csrfToken, 'csrf-token');
  const bad = await app.inject({
    method: 'DELETE',
    url: '/api/v1/session',
    headers: { cookie, 'x-csrf-token': 'wrong' },
  });
  assert.equal(bad.statusCode, 403);
  assert.equal(
    (
      await app.inject({
        method: 'GET',
        url: '/api/v1/policies',
        headers: { cookie },
      })
    ).statusCode,
    200,
  );
  const signedOut = await app.inject({
    method: 'DELETE',
    url: '/api/v1/session',
    headers: { cookie, 'x-csrf-token': 'csrf-token' },
  });
  assert.equal(signedOut.statusCode, 204);
  assert.match(signedOut.headers['set-cookie'] as string, /session=/);
  assert.equal(
    (
      await app.inject({
        method: 'GET',
        url: '/api/v1/policies',
        headers: { cookie },
      })
    ).statusCode,
    401,
  );
  assert.equal(
    (
      await app.inject({
        method: 'DELETE',
        url: '/api/v1/session',
        headers: { cookie },
      })
    ).statusCode,
    204,
  );
  assert.ok(events.includes('SIGN_OUT:CSRF_INVALID'));
  await app.close();
});

test('FR-02 request list and detail expose owned records only', async () => {
  const owned = {
    id: 'request-1',
    policyId: 'policy-1',
    policyNumber: 'DEMO-001',
    proposedName: 'Mali',
    proposedRelationship: 'Sister',
    submittedAt: '2026-11-27T09:00:00.000Z',
  };
  const app = await buildApp({
    audit: async () => {},
    signIn: async () => null,
    createSession: async () => ({ token: '', csrf: '' }),
    session: async (token) =>
      token === 'owner' ? { actorId: 'owner-1', csrf: 'csrf' } : null,
    revokeSession: async () => {},
    policies: async () => [],
    policy: async () => null,
    requests: async (actor) => (actor === 'owner-1' ? [owned] : []),
    request: async (actor, id) =>
      actor === 'owner-1' && id === owned.id ? owned : null,
    createRequest: async () => '',
  });
  const headers = { cookie: 'session=owner' };
  const list = await app.inject({
    method: 'GET',
    url: '/api/v1/beneficiary-requests',
    headers,
  });
  assert.equal(list.statusCode, 200);
  assert.deepEqual(list.json(), [owned]);
  const detail = await app.inject({
    method: 'GET',
    url: '/api/v1/beneficiary-requests/request-1',
    headers,
  });
  assert.deepEqual(detail.json(), owned);
  const missing = await app.inject({
    method: 'GET',
    url: '/api/v1/beneficiary-requests/missing',
    headers,
  });
  const foreign = await app.inject({
    method: 'GET',
    url: '/api/v1/beneficiary-requests/foreign',
    headers,
  });
  assert.deepEqual(missing.json(), foreign.json());
  assert.equal(
    (
      await app.inject({
        method: 'GET',
        url: '/api/v1/beneficiary-requests',
        headers: { cookie: 'session=expired' },
      })
    ).statusCode,
    401,
  );
  await app.close();
});

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
    revokeSession: async () => {},
    requests: async () => [],
    request: async () => null,
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
    revokeSession: async () => {},
    requests: async () => [],
    request: async () => null,
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
    revokeSession: async () => {},
    requests: async () => [],
    request: async () => null,
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
    revokeSession: async () => {},
    requests: async () => [],
    request: async () => null,
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
