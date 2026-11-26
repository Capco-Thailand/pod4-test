import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import type { FastifyReply } from 'fastify';

export type Policy = {
  id: string;
  number: string;
  status: 'ACTIVE' | 'EXPIRED';
  coverage: string;
};
export type Store = {
  audit(event: AuditEvent): Promise<void>;
  signIn(email: string, password: string): Promise<{ id: string } | null>;
  createSession(actorId: string): Promise<{ token: string; csrf: string }>;
  session(token: string): Promise<{ actorId: string; csrf?: string } | null>;
  policies(actorId: string): Promise<Policy[]>;
  policy(actorId: string, policyId: string): Promise<Policy | null>;
  createRequest(
    actorId: string,
    policyId: string,
    name: string,
    relationship: string,
  ): Promise<string>;
};
export type AuditEvent = {
  actorId: string | null;
  policyId: string | null;
  action: string;
  outcome: string;
};

const error = (code: string) => ({ error: { code } });
const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code'],
      properties: { code: { type: 'string' } },
    },
  },
} as const;
const policySchema = {
  type: 'object',
  required: ['id', 'number', 'status', 'coverage'],
  properties: {
    id: { type: 'string' },
    number: { type: 'string' },
    status: { type: 'string', enum: ['ACTIVE', 'EXPIRED'] },
    coverage: { type: 'string' },
  },
} as const;

export async function buildApp(store: Store) {
  const app = Fastify({ logger: true, trustProxy: true });
  await app.register(cookie);
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: { title: 'Endorsement API', version: '1.0.0' },
    },
  });
  app.setErrorHandler(async (err, request, reply) => {
    request.log.error(err);
    if (typeof err === 'object' && err !== null && 'validation' in err) {
      if (request.url === '/api/v1/session')
        await store.audit({
          actorId: null,
          policyId: null,
          action: 'SIGN_IN',
          outcome: 'VALIDATION_ERROR',
        });
      else if (request.url.startsWith('/api/v1/policies')) {
        const session = await actor(request);
        await store.audit({
          actorId: session?.actorId ?? null,
          policyId: null,
          action:
            request.method === 'POST'
              ? 'BENEFICIARY_REQUEST_CREATE'
              : 'POLICY_READ',
          outcome: 'VALIDATION_ERROR',
        });
      }
      return reply.code(400).send(error('VALIDATION_ERROR'));
    }
    return reply.code(500).send(error('INTERNAL_ERROR'));
  });
  async function refuse(
    reply: FastifyReply,
    event: AuditEvent,
    status: number,
  ) {
    await store.audit(event);
    return reply.code(status).send(error(event.outcome));
  }
  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/api/v1/openapi.json', async () => app.swagger());
  app.post<{ Body: { email: string; password: string } }>(
    '/api/v1/session',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['csrfToken'],
            properties: { csrfToken: { type: 'string' } },
          },
          400: errorSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const actor = await store.signIn(
        request.body.email,
        request.body.password,
      );
      if (!actor)
        return refuse(
          reply,
          {
            actorId: null,
            policyId: null,
            action: 'SIGN_IN',
            outcome: 'INVALID_CREDENTIALS',
          },
          401,
        );
      const session = await store.createSession(actor.id);
      reply.setCookie('session', session.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: request.protocol === 'https',
        path: '/',
      });
      return { csrfToken: session.csrf };
    },
  );
  async function actor(request: {
    cookies: Record<string, string | undefined>;
  }) {
    const token = request.cookies.session;
    return token ? store.session(token) : null;
  }
  app.get(
    '/api/v1/policies',
    {
      schema: {
        response: {
          200: { type: 'array', items: policySchema },
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await actor(request);
      if (!session)
        return refuse(
          reply,
          {
            actorId: null,
            policyId: null,
            action: 'POLICY_READ',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      return store.policies(session.actorId);
    },
  );
  app.get<{ Params: { policyId: string } }>(
    '/api/v1/policies/:policyId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['policyId'],
          properties: { policyId: { type: 'string' } },
        },
        response: { 200: policySchema, 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const session = await actor(request);
      if (!session)
        return refuse(
          reply,
          {
            actorId: null,
            policyId: null,
            action: 'POLICY_READ',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      const policy = await store.policy(
        session.actorId,
        request.params.policyId,
      );
      if (!policy)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: null,
            action: 'POLICY_READ',
            outcome: 'POLICY_NOT_FOUND',
          },
          404,
        );
      return policy;
    },
  );
  app.post<{
    Params: { policyId: string };
    Body: { name: string; relationship: string };
  }>(
    '/api/v1/policies/:policyId/beneficiary-requests',
    {
      schema: {
        params: {
          type: 'object',
          required: ['policyId'],
          properties: { policyId: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['name', 'relationship'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', maxLength: 120 },
            relationship: { type: 'string', maxLength: 120 },
          },
        },
        response: {
          201: {
            type: 'object',
            required: ['requestId'],
            properties: { requestId: { type: 'string' } },
          },
          400: errorSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await actor(request);
      if (!session)
        return refuse(
          reply,
          {
            actorId: null,
            policyId: null,
            action: 'BENEFICIARY_REQUEST_CREATE',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      const policy = await store.policy(
        session.actorId,
        request.params.policyId,
      );
      if (!policy)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: null,
            action: 'BENEFICIARY_REQUEST_CREATE',
            outcome: 'POLICY_NOT_FOUND',
          },
          404,
        );
      if (!session.csrf || request.headers['x-csrf-token'] !== session.csrf)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: policy.id,
            action: 'BENEFICIARY_REQUEST_CREATE',
            outcome: 'CSRF_INVALID',
          },
          403,
        );
      if (policy.status !== 'ACTIVE')
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: policy.id,
            action: 'BENEFICIARY_REQUEST_CREATE',
            outcome: 'POLICY_INACTIVE',
          },
          409,
        );
      const name = request.body.name.trim();
      const relationship = request.body.relationship.trim();
      if (!name || !relationship)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: policy.id,
            action: 'BENEFICIARY_REQUEST_CREATE',
            outcome: 'VALIDATION_ERROR',
          },
          400,
        );
      const requestId = await store.createRequest(
        session.actorId,
        policy.id,
        name,
        relationship,
      );
      return reply.code(201).send({ requestId });
    },
  );
  return app;
}
