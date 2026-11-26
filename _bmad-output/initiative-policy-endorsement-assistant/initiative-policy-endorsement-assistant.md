---
type: initiative
title: "Customers can review non-binding policy endorsement proposals"
parent: none
sources:
  - docs/PRD.md
companions: []
risk: high
---

# Policy Endorsement Assistant

## Description

Build the customer-facing MVP defined in the I02 Life Insurance Policy Endorsement Assistant PRD. An authenticated customer requests a supported change to their own active policy, sees an evidence-based assessment and any deterministic recalculation, then records a decision on a non-binding proposal.

## Outcome

Customers using synthetic accounts can review and decide on endorsement proposals for their own policies, while the PRD's evaluation and safety targets are met.

## Requirements

R1 (PRD 1, 2): A customer can sign in, sign out, and access only policies and requests linked to their account; protected actions and cross-account access are rejected.

R2 (PRD 1, 2): A customer can start and submit a request for an active policy for beneficiary, correspondence address, payment frequency, or accidental-death rider changes; an expired policy cannot create a request.

R3 (PRD 1, 2): The workflow uses vector retrieval to find versioned, cited passages from both the authorized policy wording and effective endorsement rules for the requested change.

R4 (PRD 2, 3): The assistant assesses each request as `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW`, explains its reason to the customer, and identifies unresolved evidence for `NEEDS_REVIEW`.

R5 (PRD 2, 3): For an eligible change that affects premium or benefits, a separate deterministic service returns recalculated values; requests with no such impact state that relevant values remain unchanged.

R6 (PRD 2, 5): The customer can compare current and proposed policy values, including any applicable premium or benefit change, before deciding on their own proposal.

R7 (PRD 2, 5): The customer can approve or reject their own proposal; the decision, proposed values, and time appear in that customer's history.

R8 (PRD 3, 5): Assessment, recalculation, proposal, and decision actions produce an auditable record without modifying or binding live policy or coverage data.

R9 (PRD 4): The MVP's evaluation reports the PRD's classification, retrieval, assessment, citation, quote, authorization, and policy-write measures and meets their stated targets.

R10 (PRD 5): The complete MVP runs with seeded synthetic data using Docker Compose.

## Constraints

- C1 (PRD 1, 3): Use synthetic demo accounts, policy records, versioned mock documents, endorsement rules, and rating tables only.
- C2 (PRD 3): Enforce authentication, ownership, active status, required inputs, evidence scope, and tool permissions in the API before retrieval, calculation, or proposal creation.
- C3 (PRD 3): Automatic positive assessment requires support from both policy wording and applicable rules; missing, stale, contradictory, or ineligible evidence cannot advance to calculation or proposal.
- C4 (PRD 3): The assistant does not calculate money or benefits; the separate deterministic service owns recalculated values.
- C5 (PRD 3): The accidental-death rider flow does not collect or assess medical evidence and tells the customer that real coverage may require further review.
- C6 (PRD 1, 3): No draft or recorded customer decision issues coverage, changes a live policy, or binds coverage.

## Done when

- Customers complete the supported journey with seeded synthetic data through Docker Compose.
- Sign-in, sign-out, ownership checks, and active-policy restrictions are verified, including rejected cross-account actions.
- All four change types reach a draft when eligible; ineligible and unresolved cases show the appropriate status and reason.
- Each proposal shows cited policy and rule evidence, and deterministic calculation output when applicable; customer decisions appear in history.
- Evaluation meets every target in PRD section 4, including zero unauthorized approvals or live-policy writes.

## Boundaries

- The MVP includes the four change types in PRD section 1; FR-14 policy-detail expansion is outside MVP completion.
- Document upload, production identity providers, eKYC, OCR, medical underwriting, insurer integration, issuance, live-policy updates, and coverage binding are outside scope.
- The tracer path runs from customer sign-in and policy selection through authorized retrieval, assessment, optional calculation, proposal review, and recorded decision.

## References

- prd — docs/PRD.md, sections 1–5
- testing — docs/TESTING_STANDARD.md, Evaluation protocol

## Notes

- Decision: 2026-11-26 — Use the existing insurance endorsement PRD as this project's requirements, per the user's confirmation.
- Open question: The PRD links detailed FR tickets that were removed from this checkout; new tickets must be drafted or explicitly recovered and reviewed before implementation.
- Open question: The architecture register has no accepted decisions; shared service, data, and deployment choices must be settled before dependent stories are built.
