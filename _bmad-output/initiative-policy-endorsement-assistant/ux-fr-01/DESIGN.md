---
name: Policy Endorsement Assistant
description: Provisional visual tokens for the FR-01 synthetic customer journey.
status: draft
colors:
  canvas: '#F7F7F4'
  surface: '#FFFFFF'
  ink: '#182C28'
  muted: '#52635F'
  accent: '#176B59'
  border: '#CBD5CF'
  danger: '#A32929'
typography:
  body: { fontFamily: 'system-ui, sans-serif', fontSize: '16px', lineHeight: '1.5' }
  title: { fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontWeight: '700', lineHeight: '1.2' }
rounded: { sm: '4px', md: '8px' }
spacing: { gutter: '20px', section: '32px' }
components:
  primary-button: { background: '{colors.accent}', text: '{colors.surface}', radius: '{rounded.sm}' }
  field: { background: '{colors.surface}', border: '{colors.border}', radius: '{rounded.sm}' }
---

# Brand & Style

A calm, plain insurance task interface. These colors and typography are provisional because no project brand was supplied. Review them before implementation.

# Colors

Use {colors.accent} for the primary action and {colors.danger} for errors. Keep policy status and non-binding notices readable in text, without relying on color.

# Typography

Use {typography.title} for page titles and {typography.body} for content in Thai and English. Confirm the final Thai font with the design reviewer.

# Layout & Spacing

Use a single reading column with {spacing.gutter} side spacing and clear section breaks. The form follows the policy summary.

# Elevation & Depth

Use borders rather than shadows to separate content.

# Shapes

Use {rounded.sm} for controls and {rounded.md} for section panels.

# Components

Inputs have persistent labels and error text. The main button uses {components.primary-button}. The policy summary identifies ACTIVE status and current policy ownership without exposing another account.

# Do's and Don'ts

Show the request as non-binding. Do not imply coverage has changed. Avoid decorative imagery and dashboard cards.

[Mockup index](../../../design/page/index.html) · [Sign-in](../../../design/page/sign-in.html) · [Beneficiary request](../../../design/page/beneficiary-request.html)
