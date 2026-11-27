# FR-07: Cited eligibility assessment

**Title:** [Story] Cited eligibility assessment
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-07
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Explain whether an authorized request CAN_PROCEED, CANNOT_PROCEED, or NEEDS_REVIEW using policy and rule evidence.

## Source and boundaries

PRD §§2–4; initiative R4; architecture AD-4, AD-7. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Automatic CAN_PROCEED requires verified support from both authorized policy wording and effective rules, valid required inputs, and passing rule predicates.
- [ ] CANNOT_PROCEED explains a supported ineligibility; NEEDS_REVIEW names missing, stale, conflicting, or unclear evidence and what remains unresolved.
- [ ] Customer explanations are available in Thai and English, while quoted passages retain their source wording and version.
- [ ] Other than CAN_PROCEED, no calculation or proposal is created; dependency failure is visible and never appears positive.

## Scope and out of scope

In scope: Explain whether an authorized request CAN_PROCEED, CANNOT_PROCEED, or NEEDS_REVIEW using policy and rule evidence.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-03 and FR-06.

## Accepted decisions and readiness

Set model-provider and assessment contract during refinement; include prompt-injection and contradictory-evidence cases. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Three outcomes, citations, and failure state: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [assessment mockup](../../design/page/check-endorsement-eligibility.html).

