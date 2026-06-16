import type { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  brandName: 'akra',

  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

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

  shipping: {
    freeThreshold: 400,
    methods: {
      home: {
        label: 'Home Delivery',
        description: 'Courier to your address · free over 400 NIS',
        flatFee: 29.9,
      },
      pickup: {
        label: 'Pick-up Point',
        description: 'Collect from a nearby pick-up point',
        flatFee: 15,
      },
    },
  },
};
