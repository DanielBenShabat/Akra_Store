'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { X } from 'lucide-react';

const navLinks = [
  { label: 'Archive', href: '/archive' },
  { label: 'Available', href: '/available' },
  { label: 'Goosebumps', href: '/goosebumps' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

interface NavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavSheet({ open, onOpenChange }: NavSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-0 z-50 h-full w-72 bg-background shadow-xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 [left:max(0px,calc(50vw_-_215px))]"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <Dialog.Title className="text-nav font-bold uppercase tracking-nav">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 px-6 py-6">
            <ul role="list" className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Dialog.Close asChild>
                    <Link
                      href={link.href}
                      className="block py-4 border-b border-border text-nav font-medium uppercase tracking-nav hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
