**Title:** [Story] Calculate eligible premium or benefit changes
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

A separate deterministic service returns recalculated premium or benefit values only for eligible requests that need them.

## User story or requirement

As a customer or evaluator, I want calculate eligible premium or benefit changes so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 3](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-calculated-proposals/epic-calculated-proposals.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] The assistant never computes values; ineligible and review-needed requests cannot call the calculator; output agrees with seeded rating tables.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: A separate deterministic service returns recalculated premium or benefit values only for eligible requests that need them.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-10; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Rating table cases, rounding, and currency rules need refinement.
- Backlog draft; detailed acceptance, relevant UX handoff, active Issue, and implementation preflight remain pending.

## UX handoff references

N/A for backend or evaluation work; add links if a UI is included.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Applicable checks completed
- [ ] Relevant documentation updated
- [ ] Review and CI gates completed
- [ ] Related Issue and PR linked
- [ ] No unresolved blockers
