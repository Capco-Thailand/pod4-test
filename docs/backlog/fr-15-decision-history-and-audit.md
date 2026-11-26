**Title:** [Story] Show decision history and verify audit trail
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-15
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

The owner sees decisions and proposed values in history, and the complete workflow has an auditable event trail.

## User story or requirement

As a customer or evaluator, I want show decision history and verify audit trail so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 4](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-decisions-and-audit-history/epic-decisions-and-audit-history.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] History is account-scoped; assessment, calculation, proposal, and decision events follow the shared audit contract; no event changes or binds coverage.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: The owner sees decisions and proposed values in history, and the complete workflow has an auditable event trail.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-13; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Audit retention and event payload details need refinement.
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
