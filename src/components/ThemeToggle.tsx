import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem('xconvert-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Storage may be unavailable in private browsing. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = readTheme();
    setTheme(current);
    document.documentElement.dataset.theme = current;
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('xconvert-theme', next); } catch { /* The visual theme still works without persistence. */ }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Change theme">
      <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
      <span className="theme-toggle__label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
