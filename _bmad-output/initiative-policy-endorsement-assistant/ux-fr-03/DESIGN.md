# Brand & Style
Extend the existing calm, task-focused customer interface. [FR-01 DESIGN.md](../ux-fr-01/DESIGN.md) and [FR-02 DESIGN.md](../ux-fr-02/DESIGN.md) supply the established green and mint direction. The [ticket](../../../docs/tickets/fr-03-address-and-payment-frequency-requests.md) owns the field contract.

# Colors
Use {colors.ink} for policy and request facts, {colors.accent} for the submit action, and {colors.danger} for validation or access errors. Keep the non-binding notice visible as text. Never use color alone to distinguish request type or status.

# Typography
Use {typography.body} for Thai and English labels, help text, errors, and history. Keep field labels persistent and policy number legible at body size.

# Layout & Spacing
Keep a single reading flow: selected owned policy, request type, its fields, non-binding notice, submit, then history. On narrow screens stack fields with {spacing.gutter} side spacing. Do not add a dashboard or independent checkout flow.

# Elevation & Depth
Use the existing light border and subtle panel shadow. Group form controls by request type, without nested cards around each input.

# Shapes
Use {rounded.sm} controls, {rounded.md} panels, visible focus rings, and 44px minimum targets.

# Components
Use {components.primary-button} for submission and {components.status-chip} with text for policy status. A labeled request-type selector exposes address or frequency fields, never both at once. Address uses text inputs and a five-digit postal-code input; frequency uses one select with the four approved choices. Place field errors beside their labels. History groups request type, proposed values, time, and “policy unchanged”.

# Do's and Don'ts
Show “request recorded” only after server confirmation. Do not imply the policy has a stored current address or payment frequency. Do not show an apparently usable submit control on EXPIRED policies. Do not use production personal data in examples.

[Request mockup](../../../design/page/address-and-frequency.html)
