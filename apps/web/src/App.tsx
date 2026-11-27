import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, type BeneficiaryRequest, type Policy } from './api';
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
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    signedOut: 'You have signed out.',
    signOutFailed: 'Sign-out failed. Try again.',
    history: 'Your requests',
    historyLoading: 'Loading your requests…',
    noRequests: 'No requests have been submitted yet.',
    historyNote: 'Submitted requests do not change policy or coverage.',
    requestRecorded: 'Request recorded; policy unchanged',
    proposed: 'Proposed',
    expired:
      'This policy has expired. You can view it, but cannot submit a change request.',
    workspace: 'Your policies and requests',
    activeStatus: 'ACTIVE',
    expiredStatus: 'EXPIRED',
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
    signOut: 'ออกจากระบบ',
    signingOut: 'กำลังออกจากระบบ…',
    signedOut: 'ออกจากระบบแล้ว',
    signOutFailed: 'ออกจากระบบไม่สำเร็จ โปรดลองอีกครั้ง',
    history: 'คำขอของคุณ',
    historyLoading: 'กำลังโหลดคำขอ…',
    noRequests: 'ยังไม่มีคำขอที่ส่ง',
    historyNote: 'คำขอที่ส่งไม่เปลี่ยนแปลงกรมธรรม์หรือความคุ้มครอง',
    requestRecorded: 'บันทึกคำขอแล้ว กรมธรรม์ยังไม่เปลี่ยนแปลง',
    proposed: 'เสนอ',
    expired: 'กรมธรรม์นี้หมดอายุแล้ว คุณดูข้อมูลได้ แต่ส่งคำขอเปลี่ยนแปลงไม่ได้',
    workspace: 'กรมธรรม์และคำขอของคุณ',
    activeStatus: 'มีผลบังคับ',
    expiredStatus: 'หมดอายุ',
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
  const [requests, setRequests] = useState<BeneficiaryRequest[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [requestDetail, setRequestDetail] = useState<BeneficiaryRequest | null>(
    null,
  );
  const [policyId, setPolicyId] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const signInRef = useRef<HTMLHeadingElement>(null);
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
  useEffect(() => {
    if (signedOut) signInRef.current?.focus();
  }, [signedOut]);

  function clearProtected() {
    sessionStorage.removeItem('session-seen');
    setEmail('');
    setPassword('');
    setName('');
    setRelationship('');
    setCsrf(null);
    setPolicies([]);
    setRequests([]);
    setPolicyId('');
    setRequestId('');
    setExpandedRequest(null);
    setRequestDetail(null);
  }
  async function loadWorkspace() {
    setLoading(true);
    setHistoryLoading(true);
    try {
      const owned = await api.policies();
      setPolicies(owned);
      setPolicyId(owned[0]?.id ?? '');
      const history = await api.requests();
      setRequests(history);
    } catch (cause) {
      clearProtected();
      setError(
        cause instanceof Error && cause.message === 'UNAUTHENTICATED'
          ? 'access'
          : 'unavailable',
      );
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }
  useEffect(() => {
    let cancelled = false;
    api
      .restore()
      .then(async (session) => {
        if (cancelled) return;
        sessionStorage.setItem('session-seen', '1');
        setCsrf(session.csrfToken);
        await loadWorkspace();
      })
      .catch((cause) => {
        if (cancelled) return;
        if (cause instanceof Error && cause.message === 'UNAUTHENTICATED') {
          if (sessionStorage.getItem('session-seen')) {
            clearProtected();
            setError('access');
          }
        } else setError('unavailable');
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  async function signOut() {
    if (!csrf || signingOut) return;
    setSigningOut(true);
    setError('');
    try {
      await api.signOut(csrf);
      clearProtected();
      setSignedOut(true);
    } catch {
      setError('signOutFailed');
    } finally {
      setSigningOut(false);
    }
  }
  async function openRequest(id: string) {
    if (expandedRequest === id) {
      setExpandedRequest(null);
      setRequestDetail(null);
      return;
    }
    try {
      const detail = await api.requestDetail(id);
      setRequestDetail(detail);
      setExpandedRequest(id);
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'UNAUTHENTICATED') {
        clearProtected();
        setError('access');
      } else setError('unavailable');
    }
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api.signIn(email, password);
      sessionStorage.setItem('session-seen', '1');
      setCsrf(session.csrfToken);
      setSignedOut(false);
      await loadWorkspace();
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
      setHistoryLoading(true);
      try {
        setRequests(await api.requests());
      } finally {
        setHistoryLoading(false);
      }
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      if (code === 'UNAUTHENTICATED') clearProtected();
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
        {signedOut && <p role="status">{t.signedOut}</p>}
        {restoring ? (
          <p role="status">{t.loading}</p>
        ) : !csrf ? (
          <>
            <h1 ref={signInRef} tabIndex={-1}>
              {t.signIn}
            </h1>
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
            <div className="account-control">
              <h1>{t.workspace}</h1>
              <button
                className="secondary"
                type="button"
                disabled={signingOut}
                onClick={signOut}
              >
                {signingOut ? t.signingOut : t.signOut}
              </button>
            </div>
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
                    {selected?.number} ·{' '}
                    <strong className="status-chip">
                      {selected?.status === 'EXPIRED'
                        ? t.expiredStatus
                        : t.activeStatus}
                    </strong>
                  </p>
                  <p>{selected?.coverage}</p>
                  <p className="small">{t.unchanged}</p>
                </section>
                {selected?.status === 'EXPIRED' ? (
                  <section className="panel" role="status">
                    <h2>{t.requestTitle}</h2>
                    <p>{t.expired}</p>
                  </section>
                ) : (
                  <form className="panel" onSubmit={submit} noValidate>
                    <h2>{t.requestTitle}</h2>
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
                        onChange={(event) =>
                          setRelationship(event.target.value)
                        }
                      />
                    </div>
                    <p className="notice">{t.notice}</p>
                    <button disabled={busy || selected?.status !== 'ACTIVE'}>
                      {busy ? t.submitting : t.submit}
                    </button>
                  </form>
                )}
                {requestId && (
                  <h2 ref={successRef} tabIndex={-1} aria-live="polite">
                    {t.success}
                  </h2>
                )}
              </>
            )}
            <section className="panel">
              <h2>{t.history}</h2>
              <p>{t.historyNote}</p>
              {historyLoading ? (
                <p role="status">{t.historyLoading}</p>
              ) : requests.length === 0 ? (
                <p>{t.noRequests}</p>
              ) : (
                <ol className="history">
                  {requests.map((item) => (
                    <li key={item.id}>
                      <button
                        className="history-button"
                        type="button"
                        aria-expanded={expandedRequest === item.id}
                        onClick={() => openRequest(item.id)}
                      >
                        {item.policyNumber} · {item.proposedName}
                      </button>
                      {expandedRequest === item.id &&
                        requestDetail?.id === item.id && (
                          <div>
                            <p>
                              {t.proposed}: {requestDetail.proposedName} ·{' '}
                              {requestDetail.proposedRelationship}
                            </p>
                            <p>
                              <time dateTime={requestDetail.submittedAt}>
                                {new Date(
                                  requestDetail.submittedAt,
                                ).toLocaleString(
                                  language === 'th' ? 'th-TH' : 'en-GB',
                                )}
                              </time>
                            </p>
                            <p>{t.requestRecorded}</p>
                          </div>
                        )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
