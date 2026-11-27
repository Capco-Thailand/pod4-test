---
title: 'FR-03 address and payment-frequency requests'
type: feature
ticket: 'fr-03-address-and-payment-frequency-requests'
created: '2026-11-27'
status: built
baseline_revision: '3ef80f5d1a9e7b6ab5599ae95ac5e30774b35a80'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 1
context:
  - docs/tickets/fr-03-address-and-payment-frequency-requests.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-03/DESIGN.md
  - _bmad-output/initiative-policy-endorsement-assistant/ux-fr-03/EXPERIENCE.md
  - docs/CODING_STANDARDS.md
  - docs/TESTING_STANDARD.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent
**Problem:** Owners can submit only beneficiary requests today. They need to submit and review non-binding correspondence-address and payment-frequency requests for an owned ACTIVE policy.

**Approach:** Extend the existing session-protected request workflow, PostgreSQL persistence, typed API client, and bilingual workspace. Keep beneficiary behavior intact and show each proposal in owned history.

## Boundaries & Constraints
**Always:** Derive actor from the session; check ownership, CSRF, and ACTIVE status at the API. Validate exact approved fields and frequencies. Persist each request with a minimal audit record in one transaction. Preserve form values on language switch and failure; show success only after server confirmation.

**Never:** Change policy or coverage rows, show invented current address/frequency, store address data in audit events, reveal foreign resource details, or handle production personal data.

## I/O & Edge-Case Matrix
| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Address | Owned ACTIVE; valid Thailand fields | Submitted request and audit; typed history; unchanged policy | No error expected |
| Frequency | Owned ACTIVE; one of four values | Submitted request and audit; typed history; unchanged policy | No error expected |
| Invalid | Blank/long address, bad postcode, unknown field/frequency | No request or success audit | Field or form error in selected language |
| Refused | No session/CSRF, foreign ID, EXPIRED | No request, protected disclosure, or policy write | Existing 401/403/404/status conventions |
| Failure | Persistence or network failure | No false success; draft retained; transaction rolls back | Retryable error |

</frozen-after-approval>

## Code Map
- `apps/api/src/schema.sql`: beneficiary table and `audit_events.request_id` FK currently point only to beneficiary requests; add compatible detail-request persistence and audit reference without weakening the existing FK.
- `apps/api/src/app.ts`: `Store`, schemas, owner-scoped reads, and beneficiary POST guards; reuse session, CSRF, ownership, and ACTIVE checks for new routes, with a tagged response contract.
- `apps/api/src/store.ts`: owner-scoped SQL and `createRequest` transaction pattern; add detail-request reads and atomic writes.
- `apps/web/src/api.ts`: beneficiary-only client types and endpoints; add typed detail-request calls and history.
- `apps/web/src/App.tsx` and `style.css`: session, policy, beneficiary form, history, and bilingual copy; add request type, separate drafts, validation, focus, and typed history inside the existing page.
- `apps/api/src/{app,store}.test.ts`, `apps/web/src/App.test.tsx`, `e2e/fr-03.spec.ts`: public API, transaction, component, and browser seams. API injection cannot prove database rollback; mocked UI cannot prove persistence; browser plus database checks cover the full journey.

## Tasks & Acceptance
**Execution:**
- [ ] `apps/api/src/{app,store}.test.ts` — write focused failing cases for both valid requests, exact validation, ownership/session/CSRF/EXPIRED refusals, audit rollback, and unchanged policy rows; record red results.
- [ ] `apps/api/src/app.test.ts` — assert the generated OpenAPI request body documents the exact address fields, lengths, unknown-field rejection, and frequency enum before adding the route body schema.
- [ ] `apps/api/src/{schema.sql,app.ts,store.ts}` — add one compatible typed detail-request contract and persistence path; green the API and store cases without changing beneficiary behavior.
- [ ] `apps/web/src/App.test.tsx` — write failing component cases for both forms, draft preservation, field-named localized errors beside labels with first-invalid-field focus, typed history, EXPIRED state, and retry; prove that a successful POST followed by failed history refresh cannot create a duplicate on retry, and that a `401` during detail-history loading clears protected content.
- [ ] `apps/web/src/{api.ts,App.tsx,style.css}` — implement the bilingual request flow using existing page sections; extract a component only if it owns meaningful repeated behavior; green component cases.
- [ ] `e2e/fr-03.spec.ts` and verification record under `test-results/fr-03/` — check seeded English and Thai submissions, owned history, and expired refusal. Update API contract and ticket documentation if behavior or requirements change; sync Issue #11 after such changes.

**Acceptance Criteria:**
- Given an owned ACTIVE policy, when either valid request is submitted, then the owner sees a submitted proposal and unchanged-policy confirmation, and one request plus one minimal audit record exist.
- Given invalid fields or unsupported frequency, when submitted, then the API rejects it and no request or success audit exists.
- Given an absent session/CSRF, foreign policy, or EXPIRED policy, when submitted, then the established refusal applies with no protected data or policy write.
- Given a language change or network failure during a draft, when the form rerenders, then values remain and no false success appears.
- Given request history, when the owner opens it, then each type shows its proposed values, policy number, timestamp, and non-binding status in the selected language.

## Implementation Notes

- Red/green: address API returned 404 before the route, then 201 with owned history; UI lacked the request-type control before the form slice, then submitted and displayed the proposal. Review-loop tests first failed for OpenAPI request body, field error/focus, history GET retry, and detail-history `401`, then passed after fixes.
- Full suite: 17 ticket tests, 17 API/store tests, 14 web tests, and 9/9 Chromium E2E scenarios passed on 2026-11-27. `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` passed. Latest local HTML report: `test-results/fr-03/2026-11-27-14-47-35.html`; browser screenshots are attached.
- Criterion coverage: valid requests/audit/unchanged policy, typed owned history, validation, session/CSRF/ownership/EXPIRED refusal, and bilingual browser flow passed. Forced audit rollback was covered by a controlled store test; running PostgreSQL fault injection and visual baseline comparison remain unverified.

## Plan Change Log

- Quick review found generic address errors, duplicate-risk retry after successful POST, and a `401` detail-history path that retained protected content. The UI test task now requires field-level feedback/focus, separate recovery for failed history refresh, and session clearing on every protected detail-history read. This avoids ambiguous retry and stale protected content. KEEP the existing tested session, policy, beneficiary, and successful detail-request flows.
- Quick review found the new POST lacked a request body schema despite the coding standard. The API task now requires an OpenAPI contract test before route schema implementation. This avoids drift between published fields and runtime validation. KEEP the owner/CSRF/ACTIVE gate order, atomic detail-request/audit SQL, and the green seeded browser flow.

## Review Triage Log

- `medium`, bad_plan — `App.tsx` address validation shows one generic message; the UX spine requires field names, adjacent errors, and first-invalid-field focus. The plan did not spell those observable checks out in the UI test task.
- `medium`, bad_plan — `App.tsx` sets success before history refresh; a failed GET leaves success and an error, and retry posts again. The plan did not distinguish POST failure from post-success refresh failure.
- `high`, bad_plan — request-type change catches a detail-history `401` as a generic error and keeps protected content visible; the UX spine requires session clearing. The plan did not require a test for this path.
- `medium`, bad_plan — `app.ts` detail POST has no request body schema, so generated OpenAPI omits FR-03 payload fields. The plan's API task lacked a published-contract test.
- `false`, rejected — the `test-results/fr-03/` folder matches the active FR-03 ticket ID required by `docs/TESTING_STANDARD.md`; the full regression suite may run in that ticket's report.
- `false`, rejected — the form may submit a second intentional request after a confirmed response, as the existing beneficiary flow does. The UX contract disables repeated presses only while a POST is pending; the separate history retry performs only GET and is covered by a passing test.
- `low`, patch — `App.tsx` keeps the beneficiary form heading when address or frequency is selected, which mislabels the user's active task in both languages. Use the existing localized type headings, as the EXPIRED panel already does.

## Design Notes
The existing customer workspace remains the screen boundary. Request-type switching and history type tags carry behavior; no new navigation is needed.

## Verification
**Commands:**
- `npm test` — API transaction/guard and web component checks pass.
- `npm run typecheck && npm run lint && npm run format:check && npm run build` — repository gates pass.
- `npm run test:e2e` — seeded browser suite passes with a dated report; record FR-03 criterion coverage and uncovered cases.

**Manual checks (if no CLI):**
- Inspect English and Thai narrow viewport, keyboard focus, error association, and EXPIRED explanation against UX spines.
