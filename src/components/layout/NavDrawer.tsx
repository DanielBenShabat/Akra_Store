'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useNav } from './NavContext';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items?: NavItem[];
  closeIconUrl?: string | null;
}

const defaultNavLinks: NavItem[] = [
  { label: 'Archive', href: '/archive' },
  { label: 'Available', href: '/available' },
  { label: 'Goosebumps', href: '/goosebumps' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

export function NavDrawer({ items, closeIconUrl }: Props) {
  const navLinks = items && items.length > 0 ? items : defaultNavLinks;
  const { navOpen, closeNav } = useNav();

  if (!navOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={closeNav}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed top-0 z-50 h-screen w-72 bg-background shadow-2xl flex flex-col"
        style={{ left: 'max(0px, calc((100vw - 430px) / 2))' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="text-nav font-bold uppercase tracking-nav">Menu</span>
          <button
            type="button"
            onClick={closeNav}
            aria-label="Close menu"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            style={{ touchAction: 'manipulation', cursor: 'pointer' }}
          >
            {closeIconUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={closeIconUrl} alt="" className="h-[18px] w-[18px] object-contain" />
            ) : (
              <X size={18} strokeWidth={1.5} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-6 py-6 overflow-y-auto">
          <ul role="list" className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeNav}
                  className="block py-4 border-b border-border text-nav font-medium uppercase tracking-nav hover:text-muted-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
