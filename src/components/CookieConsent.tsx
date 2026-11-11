import { useEffect, useState } from 'react';

type Choice = 'accepted' | 'necessary';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer = 0;
    try {
      if (!localStorage.getItem('xconvert-cookie-choice')) {
        timer = window.setTimeout(() => setVisible(true), 1600);
      }
    } catch {
      timer = window.setTimeout(() => setVisible(true), 1600);
    }
    return () => window.clearTimeout(timer);
  }, []);

  function choose(choice: Choice) {
    try { localStorage.setItem('xconvert-cookie-choice', choice); } catch { /* Storage may be unavailable in private browsing. */ }
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <aside className="cookie-banner" aria-label="Cookie preferences">
      <div>
        <strong>Privacy choices</strong>
        <p>XConvert Pro uses essential browser storage for preferences. Optional analytics are not enabled by this rebuild.</p>
        <a href="/pages/cookie-policy.html">Cookie policy</a>
      </div>
      <div className="cookie-banner__actions">
        <button type="button" className="button button--quiet" onClick={() => choose('necessary')}>Necessary only</button>
        <button type="button" className="button button--primary" onClick={() => choose('accepted')}>Accept</button>
      </div>
    </aside>
  );
}
