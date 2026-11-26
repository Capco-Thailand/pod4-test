---
name: FR-01 customer journey
status: draft
---

# Foundation

Responsive web journey for synthetic demo customers. [DESIGN.md](DESIGN.md) owns the provisional visual tokens; this file owns behavior. Thai and English apply to customer-facing copy.

# Information Architecture

Sign-in leads to the customer's policy and beneficiary request page. The page shows the owned policy summary, ACTIVE status, request form, and confirmation or refusal in one flow.

# Voice and Tone

Use direct, factual copy. Distinguish a submitted request from a changed policy. Keep the non-binding notice visible before submission and after success.

# Component Patterns

A language switch changes UI labels and messages while retaining entered form values. Inputs have persistent labels. The primary action uses {components.primary-button}. The policy summary is read-only.

# State Patterns

Sign-in: idle, submitting, invalid credentials, and authenticated. Policy: loading, owned ACTIVE, unavailable, and access refused. Request: empty, invalid fields, submitting, success, expired-policy refusal, and session/CSRF failure. Disable duplicate submission while pending. Keep typed values after recoverable errors.

# Interaction Primitives

Keyboard submission works from both forms. Move focus to the error summary after a failed submit and to the confirmation heading after success. Do not display a success state before the API confirms persistence.

# Accessibility Floor

Use semantic headings, labels, status text, visible focus, and an announced error summary. Expose policy status in words. Ensure both languages remain readable at narrow widths.

# Key Flows

A synthetic customer signs in, sees an owned ACTIVE policy, switches language, enters a beneficiary name and relationship, reads the non-binding notice, and submits. The confirmation states that the request was recorded and the policy has not changed. An unauthorized or expired-policy attempt ends with a clear refusal and no success state.

# Open decisions

Final visual identity, Thai font, exact bilingual copy, and session idle duration require review. No production branding is inferred.

[Sign-in mockup](../../../design/page/sign-in.html) · [Request mockup](../../../design/page/beneficiary-request.html)
