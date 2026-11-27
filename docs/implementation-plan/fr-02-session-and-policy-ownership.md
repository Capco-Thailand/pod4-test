---
title: 'FR-02 session and policy ownership boundaries'
type: feature
ticket: fr-02-session-and-policy-ownership
created: '2026-11-27'
status: built
baseline_revision: ec110d398799d67dc9dba9e06d8e03e47c03016f
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-02-session-and-policy-ownership.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-02/DESIGN.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-02/EXPERIENCE.md
  - design/page/session-and-policies.html
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-01 does not let customers restore or end a session or view their own submitted requests. The missing request-read boundary could expose another customer's data if added without owner checks.

**Approach:** Extend the existing opaque session and beneficiary-request APIs, then expose owned history, expired-policy guidance, and sign-out in the bilingual customer workspace.

## Boundaries & Constraints

**Always:** Derive the actor from the cookie; check session and ownership before protected reads or writes; require CSRF on authenticated writes; use the existing 30-minute sliding expiry; keep unknown and foreign IDs indistinguishable; use synthetic records and minimal audit data.

**Never:** Accept client identity as authority, expose foreign policy or request fields, update policy or coverage rows, imply a submitted request binds coverage, or add production identity and insurer flows.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Owned access | Valid session; owned policy or request | Policy/request list and detail include owned records only | Empty history has a clear UI state |
| Session lifecycle | Valid cookie on reload; valid CSRF on sign-out | Workspace restores; sign-out revokes session and clears cookie/data | Bad CSRF refuses active sign-out; missing session sign-out succeeds idempotently |
| Refused access | Anonymous, expired, revoked, foreign or unknown ID | `401` for no session; identical `404` for foreign/unknown | No protected fields, request creation, or policy write |
| Expired policy | Owned `EXPIRED` policy | Summary remains readable; no request action | API refuses request; policy unchanged |

</frozen-after-approval>

## Code Map

- `apps/api/src/app.ts`: `Store`, `actor()`, and `buildApp()` own cookie, CSRF, route schemas, error codes, and OpenAPI. Add current-session, sign-out, and owned request list/detail routes; retain authorization order.
- `apps/api/src/store.ts`: `createStore()` owns hashed session lookup, owner-scoped SQL, and transactions. Revoke by token hash with a minimal sign-out audit; join request reads to owner-scoped policies. `apps/api/src/schema.sql` already has required tables.
- `apps/api/src/server.ts`: existing two accounts and ACTIVE/EXPIRED policies provide browser fixtures; no real data.
- `apps/web/src/api.ts`: central fetch boundary; add session restore/sign-out/request reads and response types.
- `apps/web/src/App.tsx`, `style.css`: sign-in/policy workspace; add restore, protected-data cleanup, history/detail, expired read-only state, bilingual copy and focus. Extract only sections with behavior or substantial content.
- `apps/api/src/{app,store}.test.ts`, `apps/web/src/App.test.tsx`, `e2e/fr-01.spec.ts`: existing public seams and fixtures to extend; update the FR-01 expired-form assertion to the FR-02 UX contract.
- `scripts/run-e2e.mjs`, `playwright.config.ts`: current report scope is FR-01; make FR-02 browser evidence and dated report identifiable.

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/{app,store}.test.ts` — add session, CSRF, owner-scope, request-read, audit and unchanged-policy cases before API/store changes; the first API red run was blocked by missing `tsx` and is recorded in verification.
- [x] `apps/api/src/{app,store}.ts` — implement session restore/revocation and owned request routes, schemas, queries, and audit behavior.
- [x] `apps/web/src/App.test.tsx` — add failing restore, history, expired, sign-out and `401` cleanup cases before UI changes.
- [x] `apps/web/src/{api,App,style.css}` — implement API calls and bilingual accessible states following the FR-02 spines.
- [x] `e2e/`, `scripts/run-e2e.mjs`, `playwright.config.ts` — add browser scenarios for both accounts, reload, history, expired refusal and sign-out; produce dated FR-02 HTML evidence.
- [x] `docs/API_DEVELOPMENT.md`, `docs/TESTING_STANDARD.md` — document new routes, auth rules, commands, and criterion-to-evidence mapping.

**Acceptance Criteria:**
- Given two seeded accounts, when either lists or opens policies and requests, then only that account's records appear; foreign and unknown IDs return the same `404` shape.
- Given an absent, expired, or revoked session, when a protected route is called, then it returns `401` without protected fields or a write.
- Given a valid session, when the page reloads or the customer signs out with CSRF, then the workspace restores or the session is revoked and protected data clears; bad CSRF refuses revocation.
- Given an owned expired policy, when it is viewed or used for a request, then its summary remains readable, the UI shows no request form, and the API refuses creation without changing the policy.
- Given request history, loading, empty, failure, and signed-out states, when the customer changes language or navigates, then the visible copy and focus follow the UX handoff without implying coverage changed.

## Implementation Notes

Use the existing route/schema conventions and database transaction pattern. Record each focused test's red and green command/result before moving to the next slice.

## Plan Change Log

## Review Triage Log

- `high` / `patch` — `App.tsx` `clearProtected()` leaves beneficiary draft state after sign-out or `401`; the next account can see the prior account's inputs without a reload. The same state path also leaves sign-in credentials. Clear account-specific input state on session end and cover the transition in a component test.
- `false` / rejected — `openRequest()` receives IDs from the owner-scoped request list; a `404` can leave previously authorized owned policy/list data visible, but it does not expose a foreign or unknown resource. No request deep link supplies an arbitrary ID to this UI; the API returns the generic `404` without protected fields.

## Design Notes

Keep the policy selector/summary and beneficiary form as existing sections. Request history owns an expandable detail state; the account control owns sign-out pending/error behavior. Use the FR-02 secondary button, status chip, and responsive reading order without trivial wrappers.

## Verification

**Commands:**
- `npm test` — ticket scripts, API/store injection, and React states pass.
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` — app gates pass.
- `docker compose up --build -d` then `npm run test:e2e` — FR-01 regression and FR-02 browser scenarios pass; dated FR-02 HTML report and screenshots record criterion coverage.

**Manual checks (if no CLI):**
- Compare desktop and narrow screenshots with FR-02 DESIGN.md, EXPERIENCE.md, and mockup; record any uncovered criterion in the report.
