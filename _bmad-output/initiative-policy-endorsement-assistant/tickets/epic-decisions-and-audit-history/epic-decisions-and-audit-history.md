---
type: epic
title: "Customers record decisions and see history"
parent: initiative-policy-endorsement-assistant
covers: [R7, R8]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions:
  - _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md
after: [epic-calculated-proposals]
refined: false
risk: high
---

# Customers record decisions and see history

## Description

Use the customer-owned proposal and values from the preceding epic to record approval or rejection and show the decision in that customer's history. Verify all workflow actions emit the shared audit events established in the first epic.

## Outcome

A customer can decide on their own non-binding proposal and later see the decision, proposed values, and time in history.

## Done when

- Only the customer who owns a proposal can approve or reject it.
- History shows that customer's decision, proposed values, and time, with an auditable trail of the preceding workflow.
- Drafts and decisions leave the policy and coverage unchanged; the capability runs in the integrated demo environment.

## Boundaries

- This epic owns customer decisions, history, and end-to-end audit verification.
- Integrated evaluation against the PRD's measured targets belongs to the final epic.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R7–R8 and Constraints
- architecture — _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md, AD-1–AD-3 and AD-6–AD-8

## Notes

- Waits on epic-calculated-proposals because: a customer decision requires a proposal with current and proposed values.
