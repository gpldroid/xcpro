import { useState } from 'react';

type Props = { currentPath: string };
const items = [
  { label: 'Home', href: '/', glyph: '⌂' },
  { label: 'Tools', href: '/tools/', glyph: '▦' },
  { label: 'Convert', href: '/tools/convert-image.html', glyph: '⇄' },
];
const more = [
  { label: 'About', href: '/about/' },
  { label: 'Guides', href: '/archives/' },
  { label: 'Contact', href: '/contact/' },
];

export default function MobileTabBar({ currentPath }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="mobile-tabs" aria-label="Mobile navigation">
      {items.map((item) => {
        const active = currentPath === item.href || (
          item.href === '/tools/' &&
          currentPath.startsWith('/tools/') &&
          currentPath !== '/tools/convert-image.html'
        );
        return (
          <a key={item.href} href={item.href} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
            <span aria-hidden="true">{item.glyph}</span><span>{item.label}</span>
          </a>
        );
      })}
      <button type="button" aria-expanded={open} aria-controls="mobile-more-menu" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">•••</span><span>More</span>
      </button>
      {open && <div className="mobile-tabs__more" id="mobile-more-menu">{more.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>}
    </nav>
  );
}
