const copy = { en: 'ไทย', th: 'English' };
let language = 'en';
const languageButton = document.querySelector('#language');
const policy = document.querySelector('#policy');
function renderPolicy() {
  const expired = policy.value === 'expired';
  document.querySelector('#policy-number').textContent = expired ? 'DEMO-002' : 'DEMO-001';
  document.querySelector('#policy-status').textContent = expired ? (language === 'th' ? 'หมดอายุ' : 'EXPIRED') : (language === 'th' ? 'มีผลบังคับ' : 'ACTIVE');
  document.querySelector('#coverage').textContent = expired ? 'THB 500,000' : 'THB 1,000,000';
  policy.options[0].textContent = `DEMO-001 · ${language === 'th' ? 'มีผลบังคับ' : 'ACTIVE'}`;
  policy.options[1].textContent = `DEMO-002 · ${language === 'th' ? 'หมดอายุ' : 'EXPIRED'}`;
  document.querySelector('#active-action').hidden = expired;
  document.querySelector('#expired-action').hidden = !expired;
}
languageButton.addEventListener('click', () => {
  language = language === 'en' ? 'th' : 'en';
  document.documentElement.lang = language;
  languageButton.textContent = copy[language];
  document.querySelectorAll('[data-en][data-th]').forEach((item) => { item.textContent = item.dataset[language]; });
  renderPolicy();
});
policy.addEventListener('change', renderPolicy);
document.querySelector('#signout').addEventListener('click', () => {
  document.querySelector('.topbar').hidden = true;
  document.querySelector('#workspace').hidden = true;
  const signedOut = document.querySelector('#signed-out');
  signedOut.hidden = false;
  signedOut.focus();
});
