import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';
import { siteConfig } from '@/config/site';

export const SETTINGS_CACHE_TAG = 'site-settings';

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

export interface SiteSettings {
  shipping: ShippingSettings;
  logo: ImageSetting;
  topLogo: ImageSetting;
  heroBackground: ImageSetting;
}

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
};

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

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

async function readSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['shipping', 'logo', 'top_logo', 'hero_background']);

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
  };
}

export const getSiteSettings = unstable_cache(readSiteSettings, ['site-settings'], {
  tags: [SETTINGS_CACHE_TAG],
  revalidate: 3600,
});

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
