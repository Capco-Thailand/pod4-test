# FR-05: Effective endorsement rules

**Title:** [Story] Effective endorsement rules
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-05
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Seed synthetic, versioned endorsement rules and machine-readable predicates for the four supported change types.

## Source and boundaries

PRD §§1, 3; explicit FR-05 source-document ownership; architecture AD-4, AD-8. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Each rule has source ID, section ID, version, effective interval, product/change scope, and original-language citation text.
- [ ] Rules represent eligible, ineligible, and further-review scenarios without treating missing evidence as approval.
- [ ] A rule version outside its effective interval cannot support a positive assessment.

## Scope and out of scope

In scope: Seed synthetic, versioned endorsement rules and machine-readable predicates for the four supported change types.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-04.

## Accepted decisions and readiness

Set predicate fields and coverage matrix when the detailed ticket is refined. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Effective rules appear as cited assessment support; no customer rule editor: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [assessment mockup](../../design/page/check-endorsement-eligibility.html).

