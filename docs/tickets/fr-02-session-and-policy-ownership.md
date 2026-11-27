**Title:** [Story] Enforce session and policy ownership boundaries
**Labels:** `type:story`, `role:dev`, `role:be`, `role:fe`
**GitHub Issue:** https://github.com/Capco-Thailand/pod4-test/issues/7
**Feature ID:** FR-02
**Product context:** [PRD](../PRD.md)
**Risk:** High — a missing access check could expose another customer's policy or request.
**State:** Ready for ticket/UX review

## Summary and objective
Customers can sign out, see only their own policies and beneficiary requests, and read an owned expired policy without starting a request. This completes the synthetic account boundary introduced in FR-01.

## User story or requirement
As a customer, I want my session and policy access to be limited to my own account so I can review my requests without exposing another customer's data.

## Business or technical context
- Sources: [customer access epic](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/epic-customer-access-and-requests.md), [PRD](../PRD.md), [ADR 0001](../adr/0001-endorsement-mvp-architecture.md), and the implemented [FR-01 ticket](fr-01-bilingual-beneficiary-request.md).
- Use the existing synthetic accounts, opaque cookie sessions, CSRF token, and 30-minute sliding idle expiry. A page reload with a valid session restores the workspace and a usable CSRF token. Sign-out revokes the server session, clears its cookie, and discards the client CSRF token. Expired and revoked sessions cannot access protected endpoints.
- The API derives the actor from the session. It never accepts a client actor ID for policy or request access. A request read is authorized through its policy owner and request actor. Unknown and foreign resource IDs have the same `404` response shape; no foreign policy or request details are returned.
- All writes from a valid cookie session, including sign-out, require the FR-01 CSRF protection. A repeated sign-out without a valid session clears the cookie and succeeds without a protected read or write. Authorization precedes protected reads and writes. A refusal may append a minimal audit event but cannot create a beneficiary request or modify policy or coverage data.
- Customer screens and refusal copy are available in Thai and English. The policy summary shows `EXPIRED` in words and explains why its request action is unavailable. Request history describes submitted beneficiary requests as non-binding; it must not imply a policy update.

## Acceptance criteria
- [ ] A signed-in customer can list and open only owned policies and list and open only their own beneficiary requests. Each request shows its policy number, proposed name and relationship, and submission time, with a clear statement that the policy remains unchanged.
- [ ] An anonymous, expired-session, or signed-out caller receives `401` on protected policy and request endpoints. A caller requesting a foreign or unknown policy or request receives the same `404` error shape and no protected fields. A cross-account request write is refused before creation.
- [ ] A page reload with a valid session restores the owned workspace. Sign-out from an authenticated screen requires the valid CSRF token, invalidates that server session, clears the cookie, and returns the UI to sign-in. Reusing the old cookie or CSRF token cannot access data or create a request. A repeated sign-out without a valid session clears the cookie and succeeds.
- [ ] An owned `EXPIRED` policy remains visible and readable, but its beneficiary request action is unavailable in the UI and rejected by the API. The existing policy and coverage rows remain unchanged after every refused action.
- [ ] The UI distinguishes loading, empty request history, access refusal, session expiry, sign-out failure, and successful sign-out in both languages. A session-expiry message directs the customer to sign in again and clears previously shown protected data.
- [ ] API contract, authorization tests, and browser evidence cover two seeded accounts, session revocation, request visibility, and the expired-policy refusal. Audit records for refusals and sign-out contain no session token or full beneficiary details.

## Scope and out of scope
In scope: Sign-out, session revocation and expiry behavior, ownership checks on policy and beneficiary request reads and writes, owned request history, expired-policy read-only presentation, bilingual UI states, and synthetic-data verification.

Out of scope: Production identity, password reset, account management, insurer integration, other endorsement types, issuance, live policy writes, and coverage binding.

## Dependencies
FR-01 is merged; its synthetic session, policy, request, and audit contracts are the starting point. Follow [architecture](../ADR.md), [coding](../CODING_STANDARDS.md), [testing](../TESTING_STANDARD.md), and [design](../DESIGN_STANDARD.md) standards.

## Related subtasks
None assigned.

## Accepted decisions and readiness
- 2026-11-27: FR-02 extends the existing 30-minute sliding idle session and beneficiary request model; it does not introduce a second account system.
- 2026-11-27: Foreign and unknown IDs share the same not-found response to avoid disclosing resource existence.
- Ticket and UX handoff await review and merge. An active Issue and implementation preflight remain pending.

## UX handoff references
[DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-02/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-02/EXPERIENCE.md), [session and policy mockup](../../design/page/session-and-policies.html), and [mockup index](../../design/page/index.html). The UX spines govern behavior and appearance.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review and CI checks completed
- [ ] Related Issue and PR linked
- [ ] No unresolved blockers
