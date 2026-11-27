# Foundation
Responsive web flow for synthetic customers. [DESIGN.md](DESIGN.md) owns visual tokens; the [FR-03 ticket](../../../docs/tickets/fr-03-address-and-payment-frequency-requests.md) owns functional requirements. Thai and English are equal states.

# Information Architecture
The owned policy workspace from FR-02 leads to a request-type choice for an ACTIVE policy. Address and payment-frequency forms occupy the same task area, followed by owned request history. An EXPIRED policy retains its readable summary and an explanation in place of the forms. No surface suggests a current address or frequency that the policy record cannot supply.

# Voice and Tone
Use plain, non-binding language. “Request recorded; policy unchanged” / “บันทึกคำขอแล้ว กรมธรรม์ยังไม่เปลี่ยนแปลง”. “This policy has expired. You can view it, but cannot submit a change request.” / “กรมธรรม์นี้หมดอายุแล้ว คุณดูข้อมูลได้ แต่ส่งคำขอเปลี่ยนแปลงไม่ได้”. Validation names the field and expected format. Do not say “address updated” or “frequency changed”.

# Component Patterns
The selected policy summary shows policy number and text status in {components.status-chip}. A labeled request-type selector switches between address and frequency fields; switching preserves each type's in-progress values. Address fields are line 1, line 2 (optional), district, province, and five-digit postal code. Frequency offers monthly, quarterly, semiannual, and annual. Submit uses {components.primary-button}. History is a semantic list with type, proposed values, timestamp, and non-binding status.

# State Patterns
Loading names the content loading. Empty history says no requests have been submitted. Validation errors appear inline and in a focused form summary; values remain. Pending submission disables repeat submission. Success appears only after API confirmation and refreshes history. Network failure retains values and offers retry. `401` clears protected data and returns to sign-in; foreign/unknown IDs show the same generic unavailable state. An owned EXPIRED policy replaces the forms with a refusal explanation.

# Interaction Primitives
Changing language preserves selected policy, request type, and field values. Changing policy clears a prior success message, and an expired selection makes forms unavailable. Focus the first invalid field or form error after validation; focus the confirmation after success. Do not send a request from the mockup or persist example values.

# Accessibility Floor
Use semantic form, fieldset/legend or equivalent labeled type choice, persistent labels, `aria-describedby` error association, visible keyboard focus, 44px targets, and status text independent of color. Announce only meaningful confirmation or error once. Keep Thai labels and long district/province values usable at narrow widths.

# Key Flows
Mali signs in to her synthetic account, selects her ACTIVE policy, chooses correspondence address, and enters a Thailand address. After submission, she sees the proposed address in her request history and the policy-unchanged confirmation. She switches to payment frequency, selects quarterly, and submits another request. Both appear as submitted requests, without a changed policy value.

Niran selects an owned EXPIRED policy and reads its summary. The request forms are unavailable with a clear reason. A copied foreign policy ID produces a generic unavailable state and no policy detail.

[Request mockup](../../../design/page/address-and-frequency.html)
