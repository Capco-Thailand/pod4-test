---
type: epic
title: "Customers compare calculated proposals"
parent: initiative-policy-endorsement-assistant
covers: [R5, R6]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions: []
after: [epic-cited-evidence-and-assessment]
refined: false
risk: high
---

# Customers compare calculated proposals

## Description

Use the cited eligibility outcome from the preceding epic. For an eligible request that affects premium or benefits, obtain values from a separate deterministic calculation service and present a non-binding comparison.

## Outcome

A customer sees current and proposed policy values, with calculated changes when applicable, before deciding.

## Done when

- Only eligible requests advance to a proposal or a calculation call.
- The proposal shows current and proposed values and the separate service's returned calculation when needed.
- A change needing no recalculation says the relevant values remain unchanged; the capability runs in the integrated demo environment.

## Boundaries

- This epic owns the calculation service boundary and proposal display, but no decision or history record.
- The assistant never calculates monetary or benefit values itself, and no proposal binds coverage.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R5–R6 and Constraints

## Notes

- Waits on epic-cited-evidence-and-assessment because: a proposal requires an authorized request and cited eligible assessment.
