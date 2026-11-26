**Title:** [Story] Run the full seeded MVP through Docker Compose
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-17
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — integrated verification boundary.
**State:** Backlog draft

## Summary and objective

A fresh environment starts the complete seeded customer journey through Docker Compose.

## User story or requirement

As a customer or evaluator, I want run the full seeded mvp through docker compose so the complete MVP can be verified.

## Business or technical context

- Source: [epic 5](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-mvp-evaluation-and-compose/epic-mvp-evaluation-and-compose.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] The documented startup runs sign-in through decision history, including vector retrieval and the separate calculator, and produces the evaluation report.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: A fresh environment starts the complete seeded customer journey through Docker Compose.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-16; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Startup prerequisites and supported host environment need refinement.
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
