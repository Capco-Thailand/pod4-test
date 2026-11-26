**Title:** [Story] Show current and proposed policy values
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-12
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

An owner compares current values with a cited, non-binding proposal, including returned calculation results when needed.

## User story or requirement

As a customer or evaluator, I want show current and proposed policy values so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 3](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-calculated-proposals/epic-calculated-proposals.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] Eligible proposals show policy and rule citations, current and proposed values, and unchanged values when no recalculation applies; unauthorized customers cannot view them.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: An owner compares current values with a cited, non-binding proposal, including returned calculation results when needed.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-11; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: The proposal field matrix and display wording need refinement.
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
