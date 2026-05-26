import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  brandName: 'akra',

  nav: [
    { label: 'CLOTHING',         href: '/' },
    { label: 'SOCKS',            href: '/' },
    { label: 'ACCESSORIES',      href: '/' },
    { label: 'GIFT CARD',        href: '/' },
    { label: 'BRAND',            href: '/' },
    { label: 'WHERE TO FIND US', href: '/' },
  ],

  featuredCollectionTitle: "CAN'T LOOK BACKWARDS",

  footer: {
    copyright: `© ${new Date().getFullYear()} akra. All rights reserved.`,
  },

  social: {
    whatsappHref: 'https://wa.me/972500000000',
  },

  currency: {
    code: 'ILS',
    symbol: 'NIS',
  },
};
