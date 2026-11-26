import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, type Policy } from './api';
import './style.css';

type Language = 'en' | 'th';
const copy = {
  en: {
    switch: 'ไทย',
    signIn: 'Sign in',
    intro: 'Use your synthetic demo account.',
    email: 'Email',
    password: 'Password',
    loading: 'Loading your policies…',
    requestTitle: 'Request a beneficiary change',
    policy: 'Your policy',
    unchanged: 'This policy is unchanged.',
    name: 'Beneficiary name',
    relationship: 'Relationship',
    notice: 'Submitting a request does not change your policy or coverage.',
    submit: 'Submit request',
    submitting: 'Submitting…',
    success: 'Request recorded. Your policy is unchanged.',
    invalid: 'Enter a beneficiary name and relationship.',
    refused: 'This request cannot be submitted for this policy.',
    unavailable: 'The service is unavailable. Try again.',
    credentials: 'Check your email and password.',
    access: 'Your session has ended. Sign in again.',
    noPolicies: 'No policies are available.',
  },
  th: {
    switch: 'English',
    signIn: 'เข้าสู่ระบบ',
    intro: 'ใช้บัญชีสาธิต',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    loading: 'กำลังโหลดกรมธรรม์…',
    requestTitle: 'ขอเปลี่ยนผู้รับผลประโยชน์',
    policy: 'กรมธรรม์ของคุณ',
    unchanged: 'กรมธรรม์นี้ยังไม่เปลี่ยนแปลง',
    name: 'ชื่อผู้รับผลประโยชน์',
    relationship: 'ความสัมพันธ์',
    notice: 'การส่งคำขอไม่เปลี่ยนแปลงกรมธรรม์หรือความคุ้มครอง',
    submit: 'ส่งคำขอ',
    submitting: 'กำลังส่ง…',
    success: 'บันทึกคำขอแล้ว กรมธรรม์ของคุณยังไม่เปลี่ยนแปลง',
    invalid: 'กรุณากรอกชื่อผู้รับผลประโยชน์และความสัมพันธ์',
    refused: 'ไม่สามารถส่งคำขอสำหรับกรมธรรม์นี้',
    unavailable: 'ระบบไม่พร้อมใช้งาน โปรดลองอีกครั้ง',
    credentials: 'ตรวจสอบอีเมลและรหัสผ่าน',
    access: 'เซสชันสิ้นสุดแล้ว กรุณาเข้าสู่ระบบอีกครั้ง',
    noPolicies: 'ไม่มีกรมธรรม์',
  },
} as const;

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [csrf, setCsrf] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyId, setPolicyId] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const t = copy[language];
  const selected = policies.find((policy) => policy.id === policyId);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (requestId) successRef.current?.focus();
  }, [requestId]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api.signIn(email, password);
      setCsrf(session.csrfToken);
      setLoading(true);
      const owned = await api.policies();
      setPolicies(owned);
      setPolicyId(owned[0]?.id ?? '');
    } catch (cause) {
      setCsrf(null);
      setError(
        cause instanceof Error && cause.message === 'INVALID_CREDENTIALS'
          ? 'credentials'
          : 'unavailable',
      );
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setRequestId('');
    if (!name.trim() || !relationship.trim()) {
      setError('invalid');
      return;
    }
    if (!csrf || !selected) {
      setError('access');
      return;
    }
    setBusy(true);
    try {
      const result = await api.request(selected.id, csrf, name, relationship);
      setRequestId(result.requestId);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(
        code === 'POLICY_INACTIVE' || code === 'POLICY_NOT_FOUND'
          ? 'refused'
          : code === 'UNAUTHENTICATED' || code === 'CSRF_INVALID'
            ? 'access'
            : code === 'VALIDATION_ERROR'
              ? 'invalid'
              : 'unavailable',
      );
    } finally {
      setBusy(false);
    }
  }
  const message = error ? t[error as keyof typeof t] : '';
  return (
    <>
      <header>
        <div className="brand">Policy Endorsement Assistant</div>
      </header>
      <main>
        <button
          className="switch"
          type="button"
          onClick={() =>
            setLanguage((current) => (current === 'en' ? 'th' : 'en'))
          }
        >
          {t.switch}
        </button>
        {error && (
          <p className="error" role="alert" tabIndex={-1} ref={errorRef}>
            {message}
          </p>
        )}
        {!csrf ? (
          <>
            <h1>{t.signIn}</h1>
            <p>{t.intro}</p>
            <form className="panel" onSubmit={signIn} noValidate>
              <div className="field">
                <label htmlFor="email">{t.email}</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">{t.password}</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <button disabled={busy}>{t.signIn}</button>
            </form>
          </>
        ) : (
          <>
            <h1>{t.requestTitle}</h1>
            {loading ? (
              <p role="status">{t.loading}</p>
            ) : policies.length === 0 ? (
              <p>{t.noPolicies}</p>
            ) : (
              <>
                <section className="panel">
                  <h2>{t.policy}</h2>
                  <label htmlFor="policy">{t.policy}</label>
                  <select
                    id="policy"
                    value={policyId}
                    onChange={(event) => {
                      setPolicyId(event.target.value);
                      setRequestId('');
                    }}
                  >
                    {policies.map((policy) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.number}
                      </option>
                    ))}
                  </select>
                  <p>
                    {selected?.number} · <strong>{selected?.status}</strong>
                  </p>
                  <p>{selected?.coverage}</p>
                  <p className="small">{t.unchanged}</p>
                </section>
                <form className="panel" onSubmit={submit} noValidate>
                  <div className="field">
                    <label htmlFor="name">{t.name}</label>
                    <input
                      id="name"
                      maxLength={120}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="relationship">{t.relationship}</label>
                    <input
                      id="relationship"
                      maxLength={120}
                      value={relationship}
                      onChange={(event) => setRelationship(event.target.value)}
                    />
                  </div>
                  <p className="notice">{t.notice}</p>
                  <button disabled={busy || selected?.status !== 'ACTIVE'}>
                    {busy ? t.submitting : t.submit}
                  </button>
                  {selected?.status !== 'ACTIVE' && (
                    <p role="status">{t.refused}</p>
                  )}
                </form>
                {requestId && (
                  <h2 ref={successRef} tabIndex={-1} aria-live="polite">
                    {t.success}
                  </h2>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
