**Title:** [Story] Enforce session and policy ownership boundaries
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-02
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

Customers can sign out, view only owned policies and requests, and see an owned expired policy without being able to request a change.

## User story or requirement

As a customer or evaluator, I want enforce session and policy ownership boundaries so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 1](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-customer-access-and-requests/epic-customer-access-and-requests.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] The API rejects unauthenticated and cross-account reads and writes, sign-out invalidates the session, and an owned EXPIRED policy stays read-only.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: Customers can sign out, view only owned policies and requests, and see an owned expired policy without being able to request a change.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-01; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Session expiry and refusal-copy wording need refinement.
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
