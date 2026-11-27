**Title:** [Story] Submit address and payment-frequency requests
**Labels:** `type:story`, `role:dev`, `role:be`, `role:fe`
**GitHub Issue:** https://github.com/Capco-Thailand/pod4-test/issues/11
**Feature ID:** FR-03
**Product context:** [PRD](../PRD.md)
**Risk:** High — address data, ownership, and the non-binding request boundary.
**State:** Implementation in review

## Summary and objective
An authenticated owner can submit a correspondence-address or payment-frequency request for an owned ACTIVE policy. The app records the request and an audit event without changing the policy.

## User story or requirement
As a customer, I want to request a new correspondence address or payment frequency so my proposed change can be reviewed later.

## Business or technical context
- Sources: [customer access epic](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/epic-customer-access-and-requests.md), [PRD](../PRD.md), [ADR 0001](../adr/0001-endorsement-mvp-architecture.md), and [FR-02 ticket](fr-02-session-and-policy-ownership.md).
- Reuse the FR-02 cookie session, CSRF protection, owned policy lookup, ACTIVE status gate, request history, and foreign/unknown `404` shape. The server derives the actor from the session. Authorization and status checks precede protected reads and writes.
- Address request payload: `addressLine1` (required, 1–120 characters after trimming), `addressLine2` (optional, at most 120), `district` (required, 1–80), `province` (required, 1–80), `postalCode` (exactly five ASCII digits). Country is Thailand, set by the server. Reject unknown fields and whitespace-only required values. Store the proposed address only in the request, not on the policy.
- Payment-frequency payload: `frequency` is exactly one of `monthly`, `quarterly`, `semiannual`, or `annual`. Store the proposed frequency only in the request, not on the policy. The app does not infer or display a current address or payment frequency because the policy model does not supply either.
- Both request types share the existing request status semantics: submission means recorded for review, never approved or applied. Create the request and its minimal audit event atomically. Audit events identify actor, policy, request ID, type, and outcome, without full address, session token, or request payload.
- Customer-facing labels, instructions, validation, success, and refusal copy are available in Thai and English. Use synthetic values only.

## Acceptance criteria
- [ ] An authenticated owner can select an owned ACTIVE policy and submit either request type with valid fields and CSRF token. The API persists the request type, proposed values, actor, policy, timestamp, and submitted status with an audit event; the UI confirms “Request recorded; policy unchanged” in the selected language.
- [ ] The owner can see each submitted address or payment-frequency request in owned request history with policy number, request type, proposed values, timestamp, and non-binding status. Switching language preserves entered values and selection.
- [ ] Missing, blank, over-length, malformed, unknown-field, or unsupported-frequency input receives a field-specific or form-level error in the selected language. No request or success audit event is written, and the policy remains unchanged.
- [ ] Anonymous, expired-session, or signed-out callers receive `401`; missing or invalid CSRF on authenticated writes is refused. Foreign and unknown policy IDs receive the same `404` shape and no protected details. No refused action creates a request or changes policy or coverage rows.
- [ ] An owned EXPIRED policy stays readable but both request actions are unavailable in the UI and refused by the API without creating a request. Network or server failure retains entered values and offers retry without claiming success.
- [ ] API tests cover both valid payloads, validation boundaries, ownership, session/CSRF, ACTIVE status, request/audit atomicity, and unchanged policy/coverage rows. Browser E2E covers both languages, both request types, request history, and an expired-policy refusal with a seeded synthetic account; record criterion coverage and evidence.

## Scope and out of scope
In scope: Thailand-only synthetic address and enumerated frequency request submission, bilingual forms and history, authorized API persistence, minimal audit, and verification.

Out of scope: Production personal data, current address or payment schedule display, insurer integration, approval, issuance, live policy writes, coverage binding, and other endorsement types.

## Dependencies
FR-02 implementation and its owned policy/request API must merge before implementation. Follow [architecture](../ADR.md), [coding](../CODING_STANDARDS.md), [testing](../TESTING_STANDARD.md), and [design](../DESIGN_STANDARD.md) standards.

## Related subtasks
None assigned.

## Accepted decisions and readiness
- 2026-11-27: Party Mode scope approved: Thailand correspondence address uses required line 1, optional line 2, district, province, and five-digit postcode. Frequencies are monthly, quarterly, semiannual, and annual. Both remain non-binding requests.
- Ticket/UX PR #10 and FR-02 implementation PR #9 merged on 2026-11-27. Issue #11 is active; implementation preflight passed.

## UX handoff references
[DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-03/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-fr-03/EXPERIENCE.md), [request mockup](../../design/page/address-and-frequency.html), and [mockup index](../../design/page/index.html). The UX spines govern behavior and appearance.

## Definition of Done
- [ ] Acceptance criteria satisfied
- [ ] Applicable tests completed
- [ ] Relevant documentation updated
- [ ] Code review and CI checks completed
- [ ] Related Issue and PR linked
- [ ] No unresolved blockers
