'use client';

import { Accessibility, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function FloatingButtons() {
  return (
    <>
      {/* Bottom-left: Accessibility */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          type="button"
          aria-label="Accessibility options"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-on-dark hover:bg-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
        >
          <Accessibility size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom-right: WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={siteConfig.social.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-whatsapp text-on-dark hover:bg-whatsapp/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-whatsapp"
        >
          <MessageCircle size={20} strokeWidth={1.5} fill="currentColor" />
        </a>
      </div>
    </>
  );
}
