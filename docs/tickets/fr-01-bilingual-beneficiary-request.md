**Title:** [Story] Run the bilingual beneficiary request path
**Labels:** `type:story`, `role:dev`, `role:fe`, `role:be`
**GitHub Issue:** https://github.com/Capco-Thailand/pod4-test/issues/3
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High — first session, authorization, and non-binding write path.
**State:** Ready for ticket/UX review

## Summary and objective

Deliver the first runnable beneficiary request through the web, Fastify API, PostgreSQL, and audit store. One synthetic customer signs in, views an owned ACTIVE policy, and submits a request in Thai or English.

## User story or requirement

As a customer, I want to request a beneficiary change on my active policy so that I can record my intent without changing my current coverage.

## Business or technical context

- Sources: [first epic](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/epic-customer-access-and-requests.md), [ordered story split](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/tickets/tickets.toml), and [ADR 0001](../adr/0001-endorsement-mvp-architecture.md).
- Create React/Vite and Fastify workspaces, a PostgreSQL schema, migrations and minimal synthetic seed, web/API/database Compose services, and the shared audit event contract. The calculator joins Compose in the proposal epic.
- The API issues an opaque, database-backed session in an HttpOnly cookie and derives the actor on each protected call. Set SameSite explicitly and Secure under HTTPS. Cookie-authenticated state changes require CSRF protection.
- The API checks session and policy ownership before protected reads or writes, then ACTIVE status before request creation. The client cannot supply an authoritative actor ID.
- A beneficiary request stores a proposed beneficiary name and relationship as request data only. Trim whitespace; reject blank names or relationships and fields over 120 characters. This is an MVP assumption for review, not a production beneficiary identity standard.
- Request creation and its audit event commit in one transaction. Audit records event ID, actor ID, policy ID, request ID, action, outcome, and UTC time; it excludes tokens and full beneficiary details. Policy rows remain unchanged.
- Runtime JSON schemas and a versioned OpenAPI contract define request and response shapes and stable error codes.

## Acceptance criteria

- [ ] A seeded customer signs in through the API session, sees an owned ACTIVE policy, switches Thai/English, and submits a beneficiary request through the running Compose app.
- [ ] The request is persisted with name and relationship; a matching audit event is committed atomically. The policy row and coverage remain unchanged.
- [ ] Anonymous and cross-account policy reads or request writes return a stable refusal and reveal no protected data. An owned EXPIRED policy cannot create a request.
- [ ] Missing or invalid beneficiary input and missing or invalid CSRF protection reject the write without a request or success audit event.
- [ ] The UI shows localized loading, error/refusal, and success states with a clear non-binding statement.
- [ ] The API contract, migration, synthetic seed, and app startup commands are documented.

## Scope and out of scope

In scope: The minimum sign-in, owned policy view, beneficiary form, session and CSRF checks, audit event contract, and runnable web/API/database baseline.

Out of scope: Other change types, sign-out and full session lifecycle coverage (FR-02), cited assessment, calculation, approval, production identity, medical evidence, insurer integration, and coverage binding.

## Dependencies

Adopt [architecture](../ADR.md), [coding](../CODING_STANDARDS.md), [testing](../TESTING_STANDARD.md), and [design](../DESIGN_STANDARD.md) standards. UX handoff: [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-01/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-01/EXPERIENCE.md), and the mockups below.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- 2026-11-26: First epic tracer path is the bilingual beneficiary request through web, API, database, and audit.
- Assumption for review: beneficiary name and relationship are the minimum input fields; no personal identifier or document upload is collected.
- Assumption for review: demo sessions use a short server-configured idle lifetime; the implementation plan must specify the duration before build.
- Ticket/UX review, merge, active Issue, application checks, and preflight remain pending.

## UX handoff references

[Sign-in](../../design/page/sign-in.html), [policy and request](../../design/page/beneficiary-request.html), and [mockup index](../../design/page/index.html). The UX spines govern behavior and appearance.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review and CI checks completed
- [ ] Related Issue and PR linked
- [ ] No unresolved blockers
