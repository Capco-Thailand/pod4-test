# FR-13: Integrated evaluation and Compose

**Title:** [Story] Integrated evaluation and Compose
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-13
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Run the complete seeded MVP through Docker Compose and report the PRD's quality and safety targets.

## Source and boundaries

PRD §§4–5; initiative R9–R10; architecture AD-8. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Compose starts web, API, internal calculator, PostgreSQL/pgvector, migrations, and synthetic seed with health checks and internal-only data/calculator access.
- [ ] A versioned evaluation set reports denominator, passing count, percentage, failed case IDs, and source/model/rating versions for every PRD measure.
- [ ] The set covers all four change types, eligibility outcomes, missing/conflicting evidence, authorization, retries, and dependency failure.
- [ ] The PRD thresholds are met, including 100% citation/calculation completeness and zero unauthorized approvals or live-policy writes.

## Scope and out of scope

In scope: Run the complete seeded MVP through Docker Compose and report the PRD's quality and safety targets.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-12.

## Accepted decisions and readiness

Fix minimum case counts before claiming a target; mock-model tests alone do not prove model-quality targets. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

No new customer screen; use the full journey for integration and responsive checks: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [mockup index](../../design/page/index.html).

