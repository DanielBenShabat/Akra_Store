import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';
import { siteConfig } from '@/config/site';

export const SETTINGS_CACHE_TAG = 'site-settings';

// ── Existing types ──

export interface ShippingSettings {
  expressFee: number;
  standardFee: number;
  pickupFee: number;
  freeStandardEnabled: boolean;
  freeStandardThreshold: number;
}

export interface ImageSetting {
  url: string | null;
}

// ── Icons ──

export type IconSlot = 'menu' | 'cart' | 'close' | 'categoryArrow' | 'whatsapp' | 'accessibility';

export interface IconSetting {
  url: string | null;
  width: number | null;
  height: number | null;
}

export type IconSettings = Record<IconSlot, IconSetting>;

// ── Navigation ──

export interface ManagedNavItem {
  id: string;
  label: string;
  href: string;
  type: 'system' | 'custom';
  enabled: boolean;
  displayOrder: number;
}

export interface NavigationSettings {
  items: ManagedNavItem[];
}

// ── Content ──

export interface AboutContentSettings {
  title: string;
  body: string;
}

export interface ContactContentSettings {
  title: string;
  intro: string;
  whatsappLabel: string;
  whatsappHref: string;
  email: string;
  businessId: string;
}

export interface ContentSettings {
  about: AboutContentSettings;
  contact: ContactContentSettings;
}

// ── Typography ──

export interface FontScale {
  mobilePx: number;
  desktopPx: number;
}

export interface TypographyDefaults {
  pageTitle: FontScale;
  sectionTitle: FontScale;
  productTitle: FontScale;
  productPrice: FontScale;
  bodyText: FontScale;
  navText: FontScale;
}

export interface PageTypographyOverride {
  pageTitle?: Partial<FontScale>;
  sectionTitle?: Partial<FontScale>;
  productTitle?: Partial<FontScale>;
  productPrice?: Partial<FontScale>;
  bodyText?: Partial<FontScale>;
}

export interface TypographySettings {
  defaults: TypographyDefaults;
  pages: Record<string, PageTypographyOverride>;
}

// ── Page backgrounds ──

export interface PageBackgroundSetting {
  url: string | null;
  mode: 'none' | 'image';
  size: 'cover' | 'contain' | 'auto';
  position: string;
  repeat: 'no-repeat' | 'repeat';
}

export type PageBackgroundSettings = Record<string, PageBackgroundSetting>;

// ── Combined SiteSettings ──

export interface SiteSettings {
  shipping: ShippingSettings;
  logo: ImageSetting;
  topLogo: ImageSetting;
  heroBackground: ImageSetting;
  icons: IconSettings;
  navigation: NavigationSettings;
  content: ContentSettings;
  typography: TypographySettings;
  pageBackgrounds: PageBackgroundSettings;
}

// ── Defaults ──

const DEFAULT_ICONS: IconSettings = {
  menu: { url: null, width: null, height: null },
  cart: { url: null, width: null, height: null },
  close: { url: null, width: null, height: null },
  categoryArrow: { url: null, width: null, height: null },
  whatsapp: { url: null, width: null, height: null },
  accessibility: { url: null, width: null, height: null },
};

const DEFAULT_NAV_ITEMS: ManagedNavItem[] = [
  { id: 'archive', label: 'Archive', href: '/archive', type: 'system', enabled: true, displayOrder: 1 },
  { id: 'available', label: 'Available', href: '/available', type: 'system', enabled: true, displayOrder: 2 },
  { id: 'goosebumps', label: 'Goosebumps', href: '/goosebumps', type: 'system', enabled: true, displayOrder: 3 },
  { id: 'about', label: 'About', href: '/about', type: 'system', enabled: true, displayOrder: 4 },
  { id: 'contact', label: 'Contact', href: '/contact', type: 'system', enabled: true, displayOrder: 5 },
  { id: 'faq', label: 'FAQ', href: '/faq', type: 'system', enabled: true, displayOrder: 6 },
];

const DEFAULT_CONTENT: ContentSettings = {
  about: {
    title: 'About',
    body: `Life happens in a random kind of way. If you make room for randomness in your life, to the unexpected things — you discover and experience wonderful things. And that philosophy gives me, bar, the place to create straight from my heart, to my hands. No stops on the way.\n\nThe constant insistence to not follow up a line, or a knot that I've already created is what gives me the way to create my unique pieces of wearable art.\n\nAkra puts a spotlight on how I felt the day, the hour, the minute I decided to create.\n\nA huge mix of feelings straight from my mind, onto my hands to your closet.\n\nEvery piece looks completely different on each body.\n\nWhen you buy AKRA, you buy more than art — you buy your random self expression. The unexpected. Life itself.`,
  },
  contact: {
    title: 'Contact',
    intro: 'Questions about an order, a product, or a return? Reach us through the channels below.',
    whatsappLabel: 'WhatsApp',
    whatsappHref: siteConfig.social.whatsappHref,
    email: 'hello@akra.example',
    businessId: 'To be provided',
  },
};

const DEFAULT_TYPOGRAPHY: TypographySettings = {
  defaults: {
    pageTitle: { mobilePx: 24, desktopPx: 32 },
    sectionTitle: { mobilePx: 18, desktopPx: 24 },
    productTitle: { mobilePx: 14, desktopPx: 16 },
    productPrice: { mobilePx: 13, desktopPx: 14 },
    bodyText: { mobilePx: 14, desktopPx: 15 },
    navText: { mobilePx: 13, desktopPx: 14 },
  },
  pages: {},
};

const DEFAULT_PAGE_BACKGROUNDS: PageBackgroundSettings = {
  home: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  about: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  contact: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  available: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  archive: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  goosebumps: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
  faq: { url: null, mode: 'none', size: 'cover', position: 'center', repeat: 'no-repeat' },
};

export const defaultSiteSettings: SiteSettings = {
  shipping: {
    expressFee: siteConfig.shipping.methods.express.flatFee,
    standardFee: siteConfig.shipping.methods.standard.flatFee,
    pickupFee: siteConfig.shipping.methods.pickup.flatFee,
    freeStandardEnabled: true,
    freeStandardThreshold: siteConfig.shipping.freeThreshold,
  },
  logo: { url: null },
  topLogo: { url: null },
  heroBackground: { url: null },
  icons: DEFAULT_ICONS,
  navigation: { items: DEFAULT_NAV_ITEMS },
  content: DEFAULT_CONTENT,
  typography: DEFAULT_TYPOGRAPHY,
  pageBackgrounds: DEFAULT_PAGE_BACKGROUNDS,
};

// ── Generic helpers ──

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  return null;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

// ── Existing parsers ──

function parseShipping(value: unknown): ShippingSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const fallback = defaultSiteSettings.shipping;
  return {
    expressFee: numberOr(raw.expressFee, fallback.expressFee),
    standardFee: numberOr(raw.standardFee, fallback.standardFee),
    pickupFee: numberOr(raw.pickupFee, fallback.pickupFee),
    freeStandardEnabled: booleanOr(raw.freeStandardEnabled, fallback.freeStandardEnabled),
    freeStandardThreshold: numberOr(raw.freeStandardThreshold, fallback.freeStandardThreshold),
  };
}

function parseImage(value: unknown): ImageSetting {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return { url: stringOrNull(raw.url) };
}

// ── New parsers ──

function parseIconSetting(value: unknown): IconSetting {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    url: stringOrNull(raw.url),
    width: numberOrNull(raw.width),
    height: numberOrNull(raw.height),
  };
}

function parseIcons(value: unknown): IconSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const icons: Record<string, unknown> = {};
  for (const slot of ['menu', 'cart', 'close', 'categoryArrow', 'whatsapp', 'accessibility']) {
    icons[slot] = parseIconSetting(raw[slot]);
  }
  return icons as IconSettings;
}

function parseManagedNavItem(value: unknown): ManagedNavItem {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: stringOr(raw.id, ''),
    label: stringOr(raw.label, ''),
    href: stringOr(raw.href, '/'),
    type: raw.type === 'custom' ? 'custom' : 'system',
    enabled: booleanOr(raw.enabled, true),
    displayOrder: numberOr(raw.displayOrder, 0),
  };
}

function parseNavigation(value: unknown): NavigationSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(raw.items) ? raw.items.map(parseManagedNavItem) : [];
  return { items: items.length > 0 ? items : DEFAULT_NAV_ITEMS };
}

function parseAboutContent(value: unknown): AboutContentSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const fallback = DEFAULT_CONTENT.about;
  return {
    title: stringOr(raw.title, fallback.title),
    body: stringOr(raw.body, fallback.body),
  };
}

function parseContactContent(value: unknown): ContactContentSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const fallback = DEFAULT_CONTENT.contact;
  return {
    title: stringOr(raw.title, fallback.title),
    intro: stringOr(raw.intro, fallback.intro),
    whatsappLabel: stringOr(raw.whatsappLabel, fallback.whatsappLabel),
    whatsappHref: stringOr(raw.whatsappHref, fallback.whatsappHref),
    email: stringOr(raw.email, fallback.email),
    businessId: stringOr(raw.businessId, fallback.businessId),
  };
}

function parseContent(value: unknown): ContentSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    about: parseAboutContent(raw.about),
    contact: parseContactContent(raw.contact),
  };
}

function parseFontScale(value: unknown): FontScale {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    mobilePx: numberOr(raw.mobilePx, 14),
    desktopPx: numberOr(raw.desktopPx, 16),
  };
}

function parsePageTypographyOverride(value: unknown): PageTypographyOverride {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const result: PageTypographyOverride = {};
  for (const key of ['pageTitle', 'sectionTitle', 'productTitle', 'productPrice', 'bodyText'] as const) {
    const obj = raw[key];
    if (obj && typeof obj === 'object') {
      const r = obj as Record<string, unknown>;
      const override: { mobilePx?: number; desktopPx?: number } = {};
      if (typeof r.mobilePx === 'number') override.mobilePx = r.mobilePx;
      if (typeof r.desktopPx === 'number') override.desktopPx = r.desktopPx;
      if (override.mobilePx !== undefined || override.desktopPx !== undefined) {
        (result as Record<string, unknown>)[key] = override;
      }
    }
  }
  return result;
}

function parseTypography(value: unknown): TypographySettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const rawDefaults = raw.defaults && typeof raw.defaults === 'object' ? (raw.defaults as Record<string, unknown>) : {};
  const defaults: TypographyDefaults = {
    pageTitle: parseFontScale(rawDefaults.pageTitle),
    sectionTitle: parseFontScale(rawDefaults.sectionTitle),
    productTitle: parseFontScale(rawDefaults.productTitle),
    productPrice: parseFontScale(rawDefaults.productPrice),
    bodyText: parseFontScale(rawDefaults.bodyText),
    navText: parseFontScale(rawDefaults.navText),
  };
  // Merge with default typography so new fields are never undefined
  const mergedDefaults: TypographyDefaults = {
    pageTitle: { mobilePx: defaults.pageTitle.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.pageTitle.mobilePx, desktopPx: defaults.pageTitle.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.pageTitle.desktopPx },
    sectionTitle: { mobilePx: defaults.sectionTitle.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.sectionTitle.mobilePx, desktopPx: defaults.sectionTitle.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.sectionTitle.desktopPx },
    productTitle: { mobilePx: defaults.productTitle.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.productTitle.mobilePx, desktopPx: defaults.productTitle.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.productTitle.desktopPx },
    productPrice: { mobilePx: defaults.productPrice.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.productPrice.mobilePx, desktopPx: defaults.productPrice.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.productPrice.desktopPx },
    bodyText: { mobilePx: defaults.bodyText.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.bodyText.mobilePx, desktopPx: defaults.bodyText.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.bodyText.desktopPx },
    navText: { mobilePx: defaults.navText.mobilePx ?? DEFAULT_TYPOGRAPHY.defaults.navText.mobilePx, desktopPx: defaults.navText.desktopPx ?? DEFAULT_TYPOGRAPHY.defaults.navText.desktopPx },
  };
  const rawPages = raw.pages && typeof raw.pages === 'object' ? (raw.pages as Record<string, unknown>) : {};
  const pages: Record<string, PageTypographyOverride> = {};
  for (const [pageKey, pageVal] of Object.entries(rawPages)) {
    pages[pageKey] = parsePageTypographyOverride(pageVal);
  }
  return { defaults: mergedDefaults, pages };
}

function parsePageBackgroundSetting(value: unknown): PageBackgroundSetting {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    url: stringOrNull(raw.url),
    mode: raw.mode === 'image' ? 'image' : 'none',
    size: raw.size === 'contain' ? 'contain' : raw.size === 'auto' ? 'auto' : 'cover',
    position: stringOr(raw.position, 'center'),
    repeat: raw.repeat === 'repeat' ? 'repeat' : 'no-repeat',
  };
}

function parsePageBackgrounds(value: unknown): PageBackgroundSettings {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const result: PageBackgroundSettings = {};
  const pageKeys = ['home', 'about', 'contact', 'available', 'archive', 'goosebumps', 'faq'];
  for (const key of pageKeys) {
    result[key] = parsePageBackgroundSetting(raw[key]);
  }
  return result;
}

// ── Read ──

async function readSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'shipping', 'logo', 'top_logo', 'hero_background',
      'icons', 'navigation', 'content', 'typography', 'page_backgrounds',
    ]);

  if (error) {
    if (error.message.toLowerCase().includes('site_settings')) return defaultSiteSettings;
    throw new Error(error.message);
  }

  const rows = new Map((data ?? []).map((row) => [row.key as string, row.value]));
  return {
    shipping: parseShipping(rows.get('shipping')),
    logo: parseImage(rows.get('logo')),
    topLogo: parseImage(rows.get('top_logo')),
    heroBackground: parseImage(rows.get('hero_background')),
    icons: parseIcons(rows.get('icons')),
    navigation: parseNavigation(rows.get('navigation')),
    content: parseContent(rows.get('content')),
    typography: parseTypography(rows.get('typography')),
    pageBackgrounds: parsePageBackgrounds(rows.get('page_backgrounds')),
  };
}

export const getSiteSettings = unstable_cache(readSiteSettings, ['site-settings'], {
  tags: [SETTINGS_CACHE_TAG],
  revalidate: 3600,
});

// ── Update helpers ──

export async function updateShippingSettings(settings: ShippingSettings): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'shipping', value: settings }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function updateImageSetting(
  key: 'logo' | 'top_logo' | 'hero_background',
  url: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: { url } }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function updateJsonSetting(
  key: string,
  value: unknown,
): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}
