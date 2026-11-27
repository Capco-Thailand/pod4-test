# Foundation

Responsive web flow for synthetic demo customers. [DESIGN.md](DESIGN.md) owns visual tokens. Thai and English are equal customer-facing states. The FR-02 [ticket](../../../docs/tickets/fr-02-session-and-policy-ownership.md) owns functional requirements.

# Information Architecture

Sign-in leads to an owned policy workspace. A reload with a valid session restores it. Its policy selector and summary precede the beneficiary request action. The same workspace lists the current customer's requests. Sign-out returns to sign-in. No navigation exposes foreign resource IDs.

# Voice and Tone

Use direct, factual copy: “Your session has ended. Sign in again.” / “เซสชันสิ้นสุดแล้ว กรุณาเข้าสู่ระบบอีกครั้ง”; “This policy has expired. You can view it, but cannot submit a change request.” / “กรมธรรม์นี้หมดอายุแล้ว คุณดูข้อมูลได้ แต่ส่งคำขอเปลี่ยนแปลงไม่ได้”. Request history says “Request recorded; policy unchanged” / “บันทึกคำขอแล้ว กรมธรรม์ยังไม่เปลี่ยนแปลง”. Avoid suggesting that a request changed coverage.

# Component Patterns

The account control offers a labeled sign-out action using {components.secondary-button}. The policy selector lists only owned policies. Status appears as text in {components.status-chip}. Request history is a semantic list; each item identifies its policy and submitted proposal. Empty history has a plain message, not a blank region.

# State Patterns

While policies or requests load, show which content is loading. An owned ACTIVE policy keeps the FR-01 request form. An owned EXPIRED policy remains readable and replaces that form with a refusal explanation. A foreign or unknown resource shows a generic unavailable state with no protected data. On `401`, clear policy and request data, then show sign-in with the session-ended message. Sign-out shows pending feedback, clears protected data after API success, and shows a retryable error if the API fails. Repeated sign-out resolves to the signed-out state.

# Interaction Primitives

Changing language retains the selected owned policy and form values. Changing policy clears a prior request confirmation. Sign-out requires an explicit button press; while pending, disable repeated presses. After successful sign-out, move focus to the sign-in heading or status message. After a session error, focus the error summary. Never render a request as submitted before the API confirms it.

# Accessibility Floor

Use semantic headings, labeled controls, visible keyboard focus, 44px targets, and status text independent of color. Announce a meaningful sign-out or session message once. Do not put every history item in a live region. Keep Thai and English readable at narrow widths.

# Key Flows

Mali signs in to her synthetic account, selects her ACTIVE policy, and sees only her own submitted beneficiary requests. She switches to her owned EXPIRED policy and can still read its summary, but sees why a change request is unavailable. She signs out, sees the sign-in screen, and cannot reopen a protected policy with the old session.

Niran signs in to a separate synthetic account. His workspace contains only his policies and requests. A copied link to Mali's policy or request produces a generic unavailable state without revealing her details.

[Session and policy mockup](../../../design/page/session-and-policies.html)
