**Title:** [Story] Submit address and payment-frequency requests
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-03
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

An owner submits correspondence-address and payment-frequency requests for an ACTIVE policy in Thai or English.

## User story or requirement

As a customer or evaluator, I want submit address and payment-frequency requests so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 1](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/epic-customer-access-and-requests.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] Valid requests are persisted with audit events; invalid inputs, EXPIRED policies, and cross-account attempts are refused without policy writes.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: An owner submits correspondence-address and payment-frequency requests for an ACTIVE policy in Thai or English.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-02; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Exact address fields and allowed payment frequencies need refinement.
- Backlog draft; detailed acceptance, relevant UX handoff, active Issue, and implementation preflight remain pending.

## UX handoff references

Pending `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable mockups.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable checks completed
- [ ] Relevant documentation updated
- [ ] Review and CI gates completed
- [ ] Related Issue and PR linked
- [ ] No unresolved blockers
