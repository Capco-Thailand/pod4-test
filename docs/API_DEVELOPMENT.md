# API development

## Implemented FR-01 API

Run `npm install` and `docker compose up --build`. The web app and API share `http://localhost:4173`; the ingress proxies `/api` to the internal API service. Compose applies `apps/api/src/schema.sql` and seeds only synthetic accounts when `SEED_DEMO=true`. Demo credentials are `owner@example.test` or `other@example.test` with password `demo-password`. The API refuses startup if PostgreSQL or migration fails. OpenAPI is at `GET /api/v1/openapi.json` through the web ingress.

| Method and path | Success | Rejection |
| --- | --- | --- |
| `POST /api/v1/session` with email/password | `200 {csrfToken}` and HttpOnly cookie | `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS` |
| `GET /api/v1/policies` | `200` owned policy list | `401 UNAUTHENTICATED` |
| `GET /api/v1/policies/:policyId` | `200` owned policy | `401 UNAUTHENTICATED`, `404 POLICY_NOT_FOUND` |
| `POST /api/v1/policies/:policyId/beneficiary-requests` with `{name,relationship}` and `x-csrf-token` | `201 {requestId}` | `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 CSRF_INVALID`, `404 POLICY_NOT_FOUND`, `409 POLICY_INACTIVE` |

Errors use `{ "error": { "code": "..." } }`. The actor comes only from the opaque database session. Missing and foreign policies both return 404. Sessions expire after 30 idle minutes and renew on protected calls. Cookies use HttpOnly and SameSite Strict, with Secure under HTTPS. Name and relationship are trimmed, required, and at most 120 characters. A request and audit event commit together; successful sign-in commits its session and audit event together. Rejected sign-ins and protected actions append audit events with the actor and owned policy references when available. Audit excludes tokens and beneficiary details, and policy rows stay unchanged. Retrying a successful submission creates another request because FR-01 has no idempotency key. `DATABASE_URL` and `SEED_DEMO` are server-only settings; the browser uses same-origin `/api` through the web proxy.

[ADR 0001](adr/0001-endorsement-mvp-architecture.md) selects the modular TypeScript/Fastify API as the public trust boundary. FR-01 implements the first session, policy, and request routes. The calculator remains future work.

## Start and configuration

The selected runtime and server framework are recorded in [ADR.md](ADR.md). Root commands are listed above and in [README.md](../README.md). Keep secrets out of the repository and browser bundle.

If the application has a database, make migrations and test-data setup explicit. Use an isolated test store and verify that test or reset commands cannot target the application database. Document startup dependencies and what happens when a required service is unavailable.

## Public contract

For each implemented route, record its method and path, purpose, authenticated actor, validated request, success response, and failure responses. Publish a machine-readable contract such as OpenAPI when the selected stack supports it. Generate or derive client types from the same validated schemas, and update consumers when a route changes. Do not document a route as available before it exists.

| Method and path | Actor and request | Success | Rejection and failure |
| --- | --- | --- | --- |
| Add each implemented route here | Required identity and validated input | Status and response schema | Authorization, validation, conflict, and dependency errors |

## Trust, state, and side effects

- Derive the actor from a validated session or token. Client-provided identity and role fields never grant access. Check ownership or other authorization before protected reads and writes.
- Give missing and unauthorized resources a deliberate error policy; document when responses must be indistinguishable to avoid disclosing another actor's data.
- Keep writes and their required audit records in a clear transaction boundary. A retry must not accidentally repeat a side effect; document the idempotency behavior of each mutating route.
- Keep downstream services, retrieval stores, and credentials behind the server boundary. Validate their responses before returning or persisting results. A dependency failure must not look like success.
- Record stable error codes and response shapes. Avoid leaking secrets, stack traces, or unnecessary personal data in responses or logs.

## Optional AI or retrieval contract

If a route uses retrieved evidence or a model, document the source and version of each cited item, the authorization and filtering order, the maximum result size, and the outcomes for missing, stale, conflicting, or unavailable evidence. State which decisions are deterministic and which model output is advisory. Require the ticket to define gates before a model result may lead to a side effect.

## Checks and handoff

Add tests for valid input, rejected input, authorization, missing and foreign resources, dependency failure, retries, and audit behavior. Use integration tests for database and service boundaries; use browser E2E for behavior visible through the UI. Keep example requests and responses aligned with the published contract. Record the actual commands and their results in the implementation handoff. [TESTING_STANDARD.md](TESTING_STANDARD.md) defines criterion coverage and evidence requirements.
