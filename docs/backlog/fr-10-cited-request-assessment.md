**Title:** [Story] Assess requests with cited evidence
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

Explain CAN_PROCEED, CANNOT_PROCEED, or NEEDS_REVIEW using policy and rule citations in Thai or English.

## User story or requirement

As a customer or evaluator, I want assess requests with cited evidence so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 2](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-cited-evidence-and-assessment/epic-cited-evidence-and-assessment.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] Positive assessment requires both evidence classes; missing, stale, or conflicting evidence yields NEEDS_REVIEW with unresolved facts; ineligible cases yield CANNOT_PROCEED; neither blocked case advances.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: Explain CAN_PROCEED, CANNOT_PROCEED, or NEEDS_REVIEW using policy and rule citations in Thai or English.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-09; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Scenario matrix and explanation wording need refinement.
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
