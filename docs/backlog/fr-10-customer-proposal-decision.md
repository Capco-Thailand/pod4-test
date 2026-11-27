# FR-10: Customer proposal decision

**Title:** [Story] Customer proposal decision
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-10
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

The owning customer can approve or reject one pending non-binding proposal.

## Source and boundaries

PRD §§1–3, 5; initiative R7–R8; architecture AD-2, AD-3, AD-7. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Only the proposal owner with a valid session can record a decision, protected by CSRF and an atomic one-decision transition.
- [ ] Approval rechecks owner, ACTIVE status, policy revision, source effectiveness, and quote validity; stale proposals require reassessment.
- [ ] A retry with the same idempotency key returns the recorded result; competing decisions cannot both succeed.
- [ ] Approval and rejection record a decision and audit event without changing policy or coverage.

## Scope and out of scope

In scope: The owning customer can approve or reject one pending non-binding proposal.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-09.

## Accepted decisions and readiness

Define decision confirmation UI and retry semantics in the detailed ticket. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Decision confirmation and recorded outcomes: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [decision mockup](../../design/page/proposal-review.html).

