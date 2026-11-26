**Title:** [Story] Seed versioned policy wording for demo products
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-04
**Product context:** [PRD](../PRD.md)
**Risk:** High — authorization, evidence, or non-binding workflow boundary.
**State:** Backlog draft

## Summary and objective

Provide synthetic, versioned policy wording for the demo policies so an authorized request can cite the correct product and version.

## User story or requirement

As a customer or evaluator, I want seed versioned policy wording for demo products so the endorsement journey can continue safely.

## Business or technical context

- Source: [epic 2](../../_bmad-output/initiative-policy-endorsement-assistant/tickets/epic-cited-evidence-and-assessment/epic-cited-evidence-and-assessment.md), [PRD](../PRD.md), and [architecture](../adr/0001-endorsement-mvp-architecture.md).
- Use synthetic data only. Enforce account ownership and ACTIVE-policy restrictions at the API boundary where applicable. No request, proposal, or decision changes or binds coverage.

## Acceptance criteria

- [ ] Each seeded product has retrievable policy passages with stable section IDs and version metadata; retrieval never exposes another customer's policy context.
- [ ] Unauthorized or cross-account actions are rejected before protected reads or side effects; the existing policy record remains unchanged.
- [ ] The outcome is observable in the running seeded app or its documented evaluation report.

## Scope and out of scope

In scope: Provide synthetic, versioned policy wording for the demo policies so an authorized request can cite the correct product and version.
Out of scope: Production identity, insurer integration, issuance, live policy writes, and coverage binding.

## Dependencies

FR-08; complete the preceding epic's relevant contract before implementation.

## Related subtasks

None assigned.

## Accepted decisions and readiness

- Open question: The product matrix, version dates, and exact source passages need review before build.
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
