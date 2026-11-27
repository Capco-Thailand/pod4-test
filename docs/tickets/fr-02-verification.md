# FR-02 verification

Run date: 2026-11-27. Synthetic accounts: `owner@example.test` and `other@example.test`; active and expired policies from `apps/api/src/server.ts`.

| Criterion | Evidence | Result | Remaining |
| --- | --- | --- | --- |
| Owned policy and request reads | `apps/api/src/app.test.ts`: owned request list/detail and FR-01 policy access; `apps/api/src/store.test.ts`: actor and policy owner SQL; `apps/web/src/App.test.tsx`: history detail | Pass (`npm test`) | Pixel baseline comparison unavailable |
| Anonymous, expired, foreign, unknown refusal | API injection tests for anonymous/foreign request and policy IDs; FR-01 request creation refusal test | Pass (`npm test`) | Real-clock expiry not simulated; browser access checks passed |
| Restore and sign-out | API injection session/CSRF/revocation test; component reload/sign-out test; store transaction test | Pass (`npm test`) | Pixel baseline comparison unavailable |
| Expired policy read-only | FR-01 API test checks `409`; UI renders explanation instead of request form; `e2e/fr-01.spec.ts` updated | API and browser pass | Pixel baseline comparison unavailable |
| Bilingual loading, history, access, sign-out states | UI implementation and component tests for restore, empty/history, expired reload, sign-out failure, Thai expired copy | Pass (`npm test`) | Pixel baseline comparison unavailable |
| API contract, audit, browser evidence | OpenAPI route schemas, API tests, minimal sign-out audit transaction; `e2e/fr-02.spec.ts` | API and browser pass | Pixel baseline comparison unavailable |

Red/green cycles:

- `FR-02 reload restores workspace and sign-out clears it`: `npm run test --workspace @endorsement/web -- --run -t 'FR-02 reload restores'` failed because reload stayed at sign-in; passed after the UI change.
- `FR-02 opening history reads the owned request detail`: the focused command failed because no detail GET occurred; passed after the detail read was added.
- `FR-02 expired reload clears protected data and explains sign-in`: the focused command failed because no alert appeared; passed after session marker handling was added.
- `FR-02 account transition clears credentials and beneficiary draft`: the focused component test failed because the first account's email remained after sign-out; passed after `clearProtected()` cleared account-specific fields.
- API session test was written before its implementation, but the initial red command could not start because `tsx` was missing. After `npm ci` succeeded, the API suite passed. This is not a confirmed red step.

`npm test` passed: 17 script, 12 API, and 9 web tests. Browser E2E ran against temporary local PostgreSQL, Vite, and Google Chrome 158.0.8127.89 because Docker was unavailable. `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` passed 7/7 scenarios on a cleared synthetic request fixture after the cross-session cleanup fix. The latest dated HTML report is `test-results/fr-02/2026-11-27-12-01-08.html` (ignored local artifact) with passing-scenario screenshots. Baseline commit: `ec110d3`.

The first hosted browser job on implementation PR #9 passed its app and browser steps, then failed the FR-01 persistence assertion because it required exactly one request while the FR-02 scenarios create more. The workflow now requires at least one request and a matching success audit for every request. The repaired SQL returned `t` against the temporary synthetic database with three requests; the hosted rerun is required before merge.

Manual visual review against FR-02 `DESIGN.md`, `EXPERIENCE.md`, and `design/page/session-and-policies.html` passed for the observed desktop (1280px) and narrow (390px) states. The screenshots show account controls before the owned policy summary, the mint text status chip, active request action or expired read-only explanation, then ordered request history. The narrow capture stacks these sections with 16px side gutters and no horizontal overflow; the mockup's non-binding wording and empty-history state appear in the browser captures. The secondary sign-out button, green primary action, readable policy facts, and visible refusal text follow the handoff. Reviewed captures in the HTML report include `data/0568e7664dd19182aaf2b99633439dc0013a487a.png` (desktop ACTIVE), `data/f7faa082b51cd2abfbc5389983dc40dd98d0d9b7.png` (narrow ACTIVE), and `data/3127ce32e564fec9137ae5c4617cb86ee1792b10.png` (narrow EXPIRED).

No approved reference images or pixel baselines exist in this checkout. The browser-viewable `.html` mockup was rendered and inspected at desktop width. The implemented workspace uses one reading column where the mockup places policy and history panels side by side; the FR-02 DESIGN.md permits a single column on wide screens. This is a manual comparison to the UX spines and mockup, not an automated screenshot diff. The report does not claim pixel identity or visual coverage for untested states.
