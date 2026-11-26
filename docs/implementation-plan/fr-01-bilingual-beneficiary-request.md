---
title: FR-01 bilingual beneficiary request
type: feature
ticket: fr-01-bilingual-beneficiary-request
created: 2026-11-26
status: built
baseline_revision: d8a55bf131025478958bde5119509dcf1d9c0231
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/tickets/fr-01-bilingual-beneficiary-request.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-01/DESIGN.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-01/EXPERIENCE.md
---

<frozen-after-approval reason="human-owned intent">

## Intent

**Problem:** The repository has no runnable application for the first customer request. A customer cannot sign in, view an owned policy, or record a beneficiary request.

**Approach:** Establish the web, API, and database baseline and implement one bilingual beneficiary request path through a server-managed session, policy authorization, CSRF protection, and transactional audit.

## Boundaries & Constraints

**Always:** Synthetic data only; API-derived identity; owner authorization before protected reads and writes; ACTIVE policy before request creation; request and audit commit together; no policy or coverage mutation. Use the merged FR-01 ticket and UX spines.

**Never:** Add other request types, assessment, calculator, policy issuance, live policy writes, or medical evidence collection.

**Approved build choices (2026-11-26):** Use the merged provisional FR-01 UX mockups as the first implementation baseline. Set the synthetic demo session idle limit to 30 minutes. The user's renewed instruction to build FR-01 approves proceeding with these previously proposed choices.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Happy path | Seeded owner, ACTIVE policy, valid name/relationship and CSRF | Request ID and atomic audit event; unchanged policy | None |
| Anonymous or other owner | Missing session or another customer's policy ID | No protected data or request | Stable 401/404 refusal |
| Expired policy | Owned EXPIRED policy | View allowed; request blocked | Stable inactive-policy code |
| Invalid input or CSRF | Blank/long fields or missing token | No request or success event | Stable validation/CSRF code |

</frozen-after-approval>

## Code Map

- `package.json`, `package-lock.json` — ticket scripts only; add npm workspaces and actual app commands.
- `apps/api/` — new Fastify modules for auth, policy, request, audit, schema, migration, and seed.
- `apps/web/` — new React/Vite app; implement sign-in, policy summary, language switch, form, and states.
- `compose.yaml` and service Dockerfiles — new web/API/PostgreSQL demo path with health and migration/seed startup.
- `docs/API_DEVELOPMENT.md`, `docs/CODING_STANDARDS.md`, `docs/TESTING_STANDARD.md`, `README.md` — document contracts and executable commands.

## Tasks & Acceptance

**Execution:**
- [ ] Adapt coding and testing standards and add workspaces, tooling, Compose, and a reproducible synthetic seed.
- [ ] Define API JSON schemas, OpenAPI surface, stable errors, and the public session/policy/request seams.
- [ ] Write focused API contract checks for sign-in, owner-only policy read, ACTIVE request creation, rejected ownership/status/input/CSRF, and unchanged policy with atomic audit. Confirm red before implementation.
- [ ] Implement database migration, session, ownership, request transaction, and audit contract; confirm API checks green.
- [ ] Write focused UI checks for bilingual labels, language switch preserving values, loading/refusal/success, keyboard focus, and non-binding copy; confirm red before implementation.
- [ ] Implement React pages and same-origin API client from the UX spines; confirm UI checks green.
- [ ] Add browser E2E for the full seeded flow and refusal cases, with an HTML report and screenshots; document uncovered criteria.
- [ ] Update API, setup, standards, and ticket documentation for actual behavior and commands.

**Acceptance Criteria:**
- Given a seeded owner and ACTIVE policy, when they submit a valid beneficiary request in either language, then the request and audit event persist and policy values do not change.
- Given an anonymous or other-account actor, when they read or submit against a policy, then no protected data or write is available.
- Given invalid input, CSRF failure, or an owned EXPIRED policy, when a request is submitted, then it is refused with no request or success event.
- Given success or refusal, when the UI renders, then the selected language and non-binding message remain clear and accessible.

## Implementation Notes

- Implemented the API, PostgreSQL schema and seed, atomic request and audit writes, bilingual React flow, Compose ingress, and browser scenarios. The API remains internal to the Compose network.
- Used the merged provisional UX and a 30-minute idle session lifetime. No application path updates policy owner, status, or coverage.
- Review fixes clear stale confirmation on policy change, restore a retryable sign-in after policy loading fails, run both development servers concurrently, and add cross-account write, CSRF, and narrow viewport browser scenarios.

## Plan Change Log

## Review Triage Log

- 2026-11-26 quick: **false**, API policy change race at `app.ts`/`store.ts`: no application path updates policy owner or status; seeded policies are read-only in FR-01. A concurrent external database edit is outside this workflow.
- 2026-11-26 quick: **medium / patch**, `App.tsx` retains success when selecting another policy; clear the prior request result on policy change.
- 2026-11-26 quick: **medium / patch**, browser scenarios omit feasible cross-account write and CSRF refusal checks; add both without claiming database inspection from a browser.
- 2026-11-26 quick: **medium / defer**, visual baseline comparison and narrow viewport evidence cannot be completed without the Compose app. Record as unverified in the handoff; add the narrow viewport case for a runnable future check.
- 2026-11-26 quick: **medium / patch**, root `dev` serial workspaces never starts Vite after API watch; run both development services concurrently.
- 2026-11-26 quick: **medium / patch**, failed policy load leaves the UI in a signed-in state without retry; return to a retryable sign-in state.

## Verification

Implementation evidence (2026-11-26):

| FR-01 criterion | Seam and expected result | Result |
| --- | --- | --- |
| Seeded owner creates request and audit without policy update | API injection `apps/api/src/app.test.ts`; transaction contract `apps/api/src/store.test.ts`; browser `e2e/fr-01.spec.ts`; hosted database assertion | API/transaction and browser passed; database assertion added for the next hosted run |
| Anonymous and other-account access refused | API injection and browser access scenario; 401/404 with no protected data | API and hosted browser passed |
| Invalid input, CSRF, and EXPIRED refused | API injection and browser refusal scenario; no create call | API and hosted browser passed |
| Bilingual, non-binding UI and focus | React component `apps/web/src/App.test.tsx`; browser success/refusal scenarios | Component and hosted browser passed; visual baseline comparison pending |

Red/green sequence: sign-in/read test failed on missing `app.js`, then passed; request test returned 404 before the route, then passed; transaction tests failed on missing `store.js`, then passed; UI test failed on missing `App`, then passed; HTTPS proxy cookie test lacked `Secure`, then passed after proxy trust configuration. Audit refusal test had zero events before audit calls, then passed; successful sign-in audit test showed one insert without a transaction, then passed after transaction implementation. `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `docker compose config --quiet`, and `git diff --cached --check` passed. `npx playwright install chromium` passed. `npm run test:e2e` ran four Chromium scenarios and archived `test-results/fr-01/2026-11-26-15-02-26.html`, but all scenarios failed with connection refused because Docker Desktop's daemon is unavailable and no PostgreSQL service is running. Full persistence, browser criterion coverage, and visual baselines remain unverified.

Hosted verification (2026-11-26): GitHub Actions run [45788376205](https://github.com/Capco-Thailand/pod4-test/actions/runs/45788376205) started the Compose stack and passed all four Chromium scenarios. Its artifact [fr-01-browser-45788376205](https://github.com/Capco-Thailand/pod4-test/actions/runs/45788376205/artifacts/15101142448) contains `test-results/fr-01/2026-11-26-16-04-10.html`, screenshots, traces, and Compose logs. Direct database persistence/audit assertions were added in the following commit and await a hosted rerun. No reviewed visual baseline comparison exists yet.

**Commands:**
- `npm test` — API, UI, and ticket checks pass.
- `npm run typecheck` — all workspaces typecheck.
- `npm run lint` — code passes configured lint.
- `npm run format:check` — code matches Prettier configuration.
- `npm run build` — web and API build.
- `npm run test:e2e` — browser journey and refusal cases pass with dated HTML report.
