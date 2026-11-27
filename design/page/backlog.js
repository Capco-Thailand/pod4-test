const byId = (id) => document.getElementById(id);
const showOnly = (ids, chosen) => ids.forEach((id) => { const el = byId(id); if (el) el.hidden = id !== chosen; });
document.querySelector('[data-signout]')?.addEventListener('click', () => { location.href = 'sign-in.html?state=ended'; });

if (new URLSearchParams(location.search).get('state') === 'ended' && byId('session-ended')) byId('session-ended').hidden = false;
if (new URLSearchParams(location.search).get('state') === 'expired' && byId('detail-expired')) showOnly(['detail-active', 'detail-expired'], 'detail-expired');
document.querySelector('[data-show="session-ended"]')?.addEventListener('click', () => { byId('session-ended').hidden = false; byId('session-ended').scrollIntoView(); });
document.querySelectorAll('[data-policy-state]').forEach((button) => button.addEventListener('click', () => showOnly(['policy-list', 'policy-empty', 'policy-unavailable'], `policy-${button.dataset.policyState}`)));
document.querySelectorAll('[data-evidence-state]').forEach((button) => button.addEventListener('click', () => showOnly(['evidence-ready', 'evidence-unresolved', 'evidence-unavailable'], `evidence-${button.dataset.evidenceState}`)));
document.querySelectorAll('[data-assessment]').forEach((button) => button.addEventListener('click', () => showOnly(['assessment-can', 'assessment-cannot', 'assessment-review', 'assessment-failure'], `assessment-${button.dataset.assessment}`)));
document.querySelectorAll('[data-history-state]').forEach((button) => button.addEventListener('click', () => showOnly(['history-list', 'history-empty'], `history-${button.dataset.historyState}`)));
document.querySelectorAll('[data-proposal-state]').forEach((button) => button.addEventListener('click', () => showOnly(['proposal-pending', 'proposal-stale', 'proposal-recorded'], `proposal-${button.dataset.proposalState}`)));

const signin = byId('signin-form');
byId('toggle-password')?.addEventListener('click', () => {
  const password = byId('password');
  const shown = password.type === 'text';
  password.type = shown ? 'password' : 'text';
  byId('toggle-password').textContent = shown ? 'Show password' : 'Hide password';
  byId('toggle-password').setAttribute('aria-pressed', String(!shown));
});
signin?.addEventListener('submit', (event) => {
  event.preventDefault();
  const accountMissing = !byId('account').value.trim();
  const passwordMissing = !byId('password').value.trim();
  byId('account-error').hidden = !accountMissing;
  byId('password-error').hidden = !passwordMissing;
  byId('account').setAttribute('aria-invalid', String(accountMissing));
  byId('password').setAttribute('aria-invalid', String(passwordMissing));
  if (accountMissing || passwordMissing) { byId('signin-error').hidden = false; byId('signin-error').focus(); return; }
  location.href = 'policies.html';
});

const request = byId('request-form');
function setRequestType() {
  const type = request?.querySelector('input[name="type"]:checked')?.value;
  document.querySelectorAll('[data-fields]').forEach((group) => { group.hidden = group.dataset.fields !== type; });
}
request?.querySelectorAll('input[name="type"]').forEach((radio) => radio.addEventListener('change', setRequestType));
request?.addEventListener('submit', (event) => {
  event.preventDefault();
  const type = request.querySelector('input[name="type"]:checked')?.value;
  const checks = type === 'beneficiary' ? {
    'beneficiary-name': !!byId('beneficiary-name').value.trim(),
    allocation: Number(byId('allocation').value) === 100,
  } : type === 'address' ? { address: !!byId('address').value.trim() } : type === 'frequency' ? { frequency: !!byId('frequency').value } : { rider: !!byId('rider').value };
  checks.effective = !!byId('effective').value;
  const invalid = Object.entries(checks).filter(([id, valid]) => {
    byId(`${id}-error`).hidden = valid;
    byId(id).setAttribute('aria-invalid', String(!valid));
    byId(id).setAttribute('aria-describedby', `${id}-error`);
    return !valid;
  });
  if (invalid.length) {
    const summary = byId('request-errors');
    summary.querySelector('p').innerHTML = `<a href="#${invalid[0][0]}">Complete the highlighted fields before recording this request.</a>`;
    summary.hidden = false;
    summary.focus();
    return;
  }
  request.hidden = true;
  byId('request-recorded').hidden = false;
  byId('request-recorded').focus();
});
document.querySelector('[data-request-expired]')?.addEventListener('click', () => {
  request.hidden = true;
  byId('request-recorded').hidden = true;
  const notice = document.createElement('div');
  notice.className = 'note warning';
  notice.innerHTML = '<h2>Read-only policy</h2><p>This policy has expired. No change request can be recorded.</p><a href="policy-detail.html?state=expired">View expired policy</a>';
  request.before(notice);
});

const thai = byId('thai-request-form');
thai?.addEventListener('submit', (event) => {
  event.preventDefault();
  const checks = { 'thai-name': !!byId('thai-name').value.trim(), 'thai-allocation': Number(byId('thai-allocation').value) === 100, 'thai-date': !!byId('thai-date').value };
  let invalid = false;
  Object.entries(checks).forEach(([id, valid]) => { byId(`${id}-error`).hidden = valid; byId(id).setAttribute('aria-invalid', String(!valid)); byId(id).setAttribute('aria-describedby', `${id}-error`); invalid ||= !valid; });
  if (invalid) { byId('thai-errors').hidden = false; byId('thai-errors').focus(); return; }
  thai.hidden = true;
  byId('thai-recorded').hidden = false;
  byId('thai-recorded').focus();
});

const dialog = byId('decision-dialog');
let decision = null;
document.querySelectorAll('[data-decide]').forEach((button) => button.addEventListener('click', () => {
  decision = button.dataset.decide;
  byId('dialog-title').textContent = decision === 'approve' ? 'Approve this proposal?' : 'Reject this proposal?';
  byId('dialog-copy').textContent = 'This records your decision only. Your policy and coverage will remain unchanged.';
  dialog.showModal();
}));
byId('cancel-decision')?.addEventListener('click', () => dialog.close());
byId('confirm-decision')?.addEventListener('click', () => {
  dialog.close();
  showOnly(['proposal-pending', 'proposal-stale', 'proposal-recorded'], 'proposal-recorded');
  byId('decision-text').textContent = `${decision === 'approve' ? 'Approval' : 'Rejection'} recorded for PROP-DEMO-1001. Your policy and coverage remain unchanged.`;
  byId('proposal-recorded').focus();
});
