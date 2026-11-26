**Title:** [Story] Measure MVP quality and safety targets
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-16
**Product context:** [PRD](../PRD.md)
**Risk:** Medium — integrated verification boundary.
**State:** Backlog draft

## Summary and objective

Run a fixed synthetic evaluation set for intent classification, retrieval, assessment, citations, calculations, access, and policy-write safety.

## User story or requirement

As a customer or evaluator, I want measure mvp quality and safety targets so the complete MVP can be verified.

## Business or technical context

- Source: [epic 5](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-mvp-evaluation-and-compose/epic-mvp-evaluation-and-compose.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] The report states case counts and every PRD section 4 measure; all thresholds pass, with zero unauthorized access, approvals, policy writes, or coverage binding.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: Run a fixed synthetic evaluation set for intent classification, retrieval, assessment, citations, calculations, access, and policy-write safety.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-15; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: Minimum sample counts must be fixed before results are claimed.
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
