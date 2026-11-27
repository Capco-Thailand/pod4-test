# FR-09: Non-binding proposal review

**Title:** [Story] Non-binding proposal review
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-09
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Show an owning customer the current and proposed policy values, citations, and any authoritative calculation result before a decision.

## Source and boundaries

PRD §§2, 3, 5; initiative R6; architecture AD-3–AD-6. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] An eligible proposal contains the requested change, current and proposed values, policy and rule citations, and applicable calculator output.
- [ ] For a change needing no recalculation, relevant premium and benefit values are shown as unchanged.
- [ ] The owner can review the proposal in Thai and English; another account cannot read it.
- [ ] Proposal creation and display never update the policy or bind coverage.

## Scope and out of scope

In scope: Show an owning customer the current and proposed policy values, citations, and any authoritative calculation result before a decision.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-08.

## Accepted decisions and readiness

Set UX handoff and proposal snapshot expiry/validity details during refinement. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Field-by-field comparison, citations, and non-binding notice: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [proposal reference](../../design/page/proposal-review.html).

