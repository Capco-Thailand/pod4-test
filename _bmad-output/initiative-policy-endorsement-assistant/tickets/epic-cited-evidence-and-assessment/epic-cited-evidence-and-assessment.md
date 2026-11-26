---
type: epic
title: "Requests receive cited assessments"
parent: initiative-policy-endorsement-assistant
covers: [R3, R4]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions:
  - _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md
after: [epic-customer-access-and-requests]
refined: false
risk: high
---

# Requests receive cited assessments

## Description

Use the authenticated policy ownership and request contract from the first epic to retrieve versioned policy wording and endorsement rules from vector storage and assess each request with cited evidence.

## Outcome

A customer receives an explained `CAN_PROCEED`, `CANNOT_PROCEED`, or `NEEDS_REVIEW` result for an authorized request.

## Done when

- Retrieval returns versioned, cited passages from the authorized policy wording and effective rules.
- Assessment explains each outcome, including what remains unresolved for `NEEDS_REVIEW`.
- Missing, stale, or conflicting evidence yields `NEEDS_REVIEW`; an ineligible request yields `CANNOT_PROCEED`. Neither advances to calculation or a proposal, and the capability runs in the integrated demo environment.

## Boundaries

- This epic owns evidence retrieval and assessment, including authorization before retrieval.
- Calculation and customer proposals belong to the next epic.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R3–R4 and Constraints
- architecture — _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md, AD-1–AD-4 and AD-6–AD-8

## Notes

- Waits on epic-customer-access-and-requests because: retrieval requires an authenticated, owner-authorized policy and a submitted request.
