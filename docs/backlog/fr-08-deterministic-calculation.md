# FR-08: Deterministic calculation

**Title:** [Story] Deterministic calculation
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-08
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Calculate premium or benefit changes through a separate internal deterministic service only for an eligible assessment.

## Source and boundaries

PRD §§2–4; initiative R5; architecture AD-5, AD-6. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Only an eligible request whose change affects premium or benefits invokes the calculator.
- [ ] The calculator uses versioned synthetic rating tables and returns currency, rating version, snapshot reference, and signed minor-unit integer strings; the API rejects mismatches.
- [ ] The assistant and browser do not calculate, round, or override monetary or benefit values.
- [ ] Ineligible, unresolved, and unchanged-value requests make no calculator call.

## Scope and out of scope

In scope: Calculate premium or benefit changes through a separate internal deterministic service only for an eligible assessment.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-07.

## Accepted decisions and readiness

Set rating tables and exact quote endpoint fields in the detailed ticket. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Exact calculator output is displayed on the proposal; no calculator controls: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [proposal reference](../../design/page/proposal-review.html).

