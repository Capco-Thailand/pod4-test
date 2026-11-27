# FR-14: Read-only policy detail expansion

**Title:** [Story] Read-only policy detail expansion
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-14
**Product context:** [PRD](../PRD.md)
**Risk:** Medium
**State:** Backlog draft

## Summary and objective

After the MVP, show synthetic insurer/product identity, coverage amounts, and key exclusions on an owned policy detail page, supported by versioned wording.

## Source and boundaries

PRD §1, Policy-detail expansion; architecture AD-2, AD-4. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Only the owning customer can view the expanded detail; an owned EXPIRED policy remains read-only and viewable.
- [ ] Coverage amounts and exclusions link to applicable versioned synthetic policy wording sections.
- [ ] The screen changes no policy, coverage, or proposal state and does not imply binding coverage.

## Scope and out of scope

In scope: After the MVP, show synthetic insurer/product identity, coverage amounts, and key exclusions on an owned policy detail page, supported by versioned wording.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-04 and FR-05; outside MVP definition of done.

## Accepted decisions and readiness

Review the absent former FR-14 ticket's three-product seed, amounts, exclusions, and section IDs before implementation; do not treat those details as accepted yet. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Post-MVP read-only coverage and citation reference; sample values require refinement: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [expanded detail](../../design/page/policy-detail-coverage.html).

