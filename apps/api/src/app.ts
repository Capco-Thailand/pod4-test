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
export type BeneficiaryRequest = {
  id: string;
  policyId: string;
  policyNumber: string;
  proposedName: string;
  proposedRelationship: string;
  submittedAt: string;
};
export type AddressProposal = {
  addressLine1: string;
  addressLine2: string;
  district: string;
  province: string;
  postalCode: string;
  country: 'Thailand';
};
export type DetailProposal =
  | { type: 'address'; proposedAddress: AddressProposal }
  | {
      type: 'frequency';
      proposedFrequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
    };
export type DetailRequest = DetailProposal & {
  id: string;
  policyId: string;
  policyNumber: string;
  status: 'SUBMITTED';
  submittedAt: string;
};
export type Store = {
  audit(event: AuditEvent): Promise<void>;
  signIn(email: string, password: string): Promise<{ id: string } | null>;
  createSession(actorId: string): Promise<{ token: string; csrf: string }>;
  session(token: string): Promise<{ actorId: string; csrf?: string } | null>;
  revokeSession(token: string, actorId: string): Promise<void>;
  policies(actorId: string): Promise<Policy[]>;
  policy(actorId: string, policyId: string): Promise<Policy | null>;
  requests(actorId: string): Promise<BeneficiaryRequest[]>;
  request(
    actorId: string,
    requestId: string,
  ): Promise<BeneficiaryRequest | null>;
  createRequest(
    actorId: string,
    policyId: string,
    name: string,
    relationship: string,
  ): Promise<string>;
  detailRequests(actorId: string): Promise<DetailRequest[]>;
  createDetailRequest(
    actorId: string,
    policyId: string,
    proposal: DetailProposal,
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
const requestSchema = {
  type: 'object',
  required: [
    'id',
    'policyId',
    'policyNumber',
    'proposedName',
    'proposedRelationship',
    'submittedAt',
  ],
  properties: {
    id: { type: 'string' },
    policyId: { type: 'string' },
    policyNumber: { type: 'string' },
    proposedName: { type: 'string' },
    proposedRelationship: { type: 'string' },
    submittedAt: { type: 'string' },
  },
} as const;
const detailRequestSchema = {
  type: 'object',
  required: ['id', 'policyId', 'policyNumber', 'type', 'status', 'submittedAt'],
  properties: {
    id: { type: 'string' },
    policyId: { type: 'string' },
    policyNumber: { type: 'string' },
    type: { type: 'string', enum: ['address', 'frequency'] },
    status: { type: 'string', enum: ['SUBMITTED'] },
    submittedAt: { type: 'string' },
    proposedAddress: {
      type: 'object',
      properties: {
        addressLine1: { type: 'string' },
        addressLine2: { type: 'string' },
        district: { type: 'string' },
        province: { type: 'string' },
        postalCode: { type: 'string' },
        country: { type: 'string' },
      },
    },
    proposedFrequency: { type: 'string' },
  },
} as const;
const detailRequestBodySchema = {
  oneOf: [
    {
      type: 'object',
      required: ['type', 'addressLine1', 'district', 'province', 'postalCode'],
      additionalProperties: false,
      properties: {
        type: { type: 'string', enum: ['address'] },
        addressLine1: { type: 'string', minLength: 1, maxLength: 120 },
        addressLine2: { type: 'string', maxLength: 120 },
        district: { type: 'string', minLength: 1, maxLength: 80 },
        province: { type: 'string', minLength: 1, maxLength: 80 },
        postalCode: { type: 'string', pattern: '^[0-9]{5}$' },
      },
    },
    {
      type: 'object',
      required: ['type', 'frequency'],
      additionalProperties: false,
      properties: {
        type: { type: 'string', enum: ['frequency'] },
        frequency: {
          type: 'string',
          enum: ['monthly', 'quarterly', 'semiannual', 'annual'],
        },
      },
    },
  ],
} as const;

export async function buildApp(store: Store) {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    ajv: { customOptions: { removeAdditional: false } },
  });
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
              ? request.url.endsWith('/detail-requests')
                ? 'DETAIL_REQUEST_CREATE'
                : 'BENEFICIARY_REQUEST_CREATE'
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
    '/api/v1/session',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['csrfToken'],
            properties: { csrfToken: { type: 'string' } },
          },
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await actor(request);
      if (!session) return reply.code(401).send(error('UNAUTHENTICATED'));
      return { csrfToken: session.csrf };
    },
  );
  app.delete(
    '/api/v1/session',
    { schema: { response: { 204: { type: 'null' }, 403: errorSchema } } },
    async (request, reply) => {
      const session = await actor(request);
      if (!session) {
        reply.clearCookie('session', { path: '/' });
        return reply.code(204).send();
      }
      if (!session.csrf || request.headers['x-csrf-token'] !== session.csrf)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: null,
            action: 'SIGN_OUT',
            outcome: 'CSRF_INVALID',
          },
          403,
        );
      await store.revokeSession(request.cookies.session!, session.actorId);
      reply.clearCookie('session', { path: '/' });
      return reply.code(204).send();
    },
  );
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
  app.get(
    '/api/v1/beneficiary-requests',
    {
      schema: {
        response: {
          200: { type: 'array', items: requestSchema },
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
            action: 'BENEFICIARY_REQUEST_READ',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      return store.requests(session.actorId);
    },
  );
  app.get<{ Params: { requestId: string } }>(
    '/api/v1/beneficiary-requests/:requestId',
    {
      schema: {
        response: {
          200: requestSchema,
          401: errorSchema,
          404: errorSchema,
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
            action: 'BENEFICIARY_REQUEST_READ',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      const owned = await store.request(
        session.actorId,
        request.params.requestId,
      );
      if (!owned)
        return refuse(
          reply,
          {
            actorId: session.actorId,
            policyId: null,
            action: 'BENEFICIARY_REQUEST_READ',
            outcome: 'REQUEST_NOT_FOUND',
          },
          404,
        );
      return owned;
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
  app.get(
    '/api/v1/detail-requests',
    {
      schema: {
        response: {
          200: { type: 'array', items: detailRequestSchema },
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
            action: 'DETAIL_REQUEST_READ',
            outcome: 'UNAUTHENTICATED',
          },
          401,
        );
      return store.detailRequests(session.actorId);
    },
  );
  const detailContext = new WeakMap<
    object,
    { actorId: string; policy: Policy }
  >();
  app.post<{ Params: { policyId: string }; Body: Record<string, unknown> }>(
    '/api/v1/policies/:policyId/detail-requests',
    {
      preValidation: async (request, reply) => {
        const session = await actor(request);
        const action = 'DETAIL_REQUEST_CREATE';
        if (!session)
          return refuse(
            reply,
            {
              actorId: null,
              policyId: null,
              action,
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
              action,
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
              action,
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
              action,
              outcome: 'POLICY_INACTIVE',
            },
            409,
          );
        detailContext.set(request, { actorId: session.actorId, policy });
      },
      schema: {
        body: detailRequestBodySchema,
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
      const { actorId, policy } = detailContext.get(request)!;
      const action = 'DETAIL_REQUEST_CREATE';
      const body = request.body;
      let proposal: DetailProposal | null = null;
      if (
        body &&
        typeof body === 'object' &&
        body.type === 'address' &&
        Object.keys(body).every((key) =>
          [
            'type',
            'addressLine1',
            'addressLine2',
            'district',
            'province',
            'postalCode',
          ].includes(key),
        )
      ) {
        const line1 =
          typeof body.addressLine1 === 'string' ? body.addressLine1.trim() : '';
        const line2 =
          typeof body.addressLine2 === 'string' ? body.addressLine2.trim() : '';
        const district =
          typeof body.district === 'string' ? body.district.trim() : '';
        const province =
          typeof body.province === 'string' ? body.province.trim() : '';
        const postalCode = body.postalCode;
        if (
          line1 &&
          line1.length <= 120 &&
          line2.length <= 120 &&
          district &&
          district.length <= 80 &&
          province &&
          province.length <= 80 &&
          typeof postalCode === 'string' &&
          /^[0-9]{5}$/.test(postalCode) &&
          (body.addressLine2 === undefined ||
            typeof body.addressLine2 === 'string')
        )
          proposal = {
            type: 'address',
            proposedAddress: {
              addressLine1: line1,
              addressLine2: line2,
              district,
              province,
              postalCode,
              country: 'Thailand',
            },
          };
      } else if (
        body &&
        typeof body === 'object' &&
        body.type === 'frequency' &&
        Object.keys(body).every((key) => ['type', 'frequency'].includes(key)) &&
        ['monthly', 'quarterly', 'semiannual', 'annual'].includes(
          String(body.frequency),
        )
      ) {
        proposal = {
          type: 'frequency',
          proposedFrequency: body.frequency as
            'monthly' | 'quarterly' | 'semiannual' | 'annual',
        };
      }
      if (!proposal)
        return refuse(
          reply,
          {
            actorId,
            policyId: policy.id,
            action,
            outcome: 'VALIDATION_ERROR',
          },
          400,
        );
      const requestId = await store.createDetailRequest(
        actorId,
        policy.id,
        proposal,
      );
      return reply.code(201).send({ requestId });
    },
  );
  return app;
}
