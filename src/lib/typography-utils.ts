import type { TypographySettings, PageTypographyOverride } from './site-settings';

/**
 * CSS custom property names for each typography token.
 */
export const TYPOGRAPHY_VARS = {
  pageTitle: '--akra-page-title-size',
  sectionTitle: '--akra-section-title-size',
  productTitle: '--akra-product-title-size',
  productPrice: '--akra-product-price-size',
  bodyText: '--akra-body-size',
  navText: '--akra-nav-size',
} as const;

/**
 * Generate a React style object with CSS custom properties for typography.
 * Apply to a page wrapper or layout element to scope the font sizes.
 *
 * On mobile (default): uses mobilePx.
 * On desktop (min-width: 768px): uses desktopPx via a media query.
 *
 * Usage in a server component:
 *   const settings = await getSiteSettings();
 *   const typographyStyle = getTypographyVars(settings.typography);
 *   return <div style={typographyStyle}>{children}</div>;
 */
export function getTypographyVars(
  typography: TypographySettings,
  pageKey?: string,
): React.CSSProperties {
  const defaults = typography.defaults;
  const pageOverride = pageKey ? typography.pages[pageKey] : undefined;

  function resolveScale(
    key: keyof typeof TYPOGRAPHY_VARS,
  ): { mobilePx: number; desktopPx: number } {
    const base = defaults[key];
    // navText is global-only, not page-overridable
    const override = key !== 'navText' ? pageOverride?.[key as keyof PageTypographyOverride] : undefined;
    return {
      mobilePx: override?.mobilePx ?? base?.mobilePx ?? 14,
      desktopPx: override?.desktopPx ?? base?.desktopPx ?? 16,
    };
  }

  const vars: Record<string, string> = {};
  for (const key of Object.keys(TYPOGRAPHY_VARS) as (keyof typeof TYPOGRAPHY_VARS)[]) {
    const scale = resolveScale(key);
    const varName = TYPOGRAPHY_VARS[key];
    // Set a single value per breakpoint using CSS clamp or just set mobile as
    // base and desktop via @media in a <style> tag. For simplicity, set both
    // as custom properties and let the consumer use them appropriately.
    vars[varName] = `${scale.mobilePx}px`;
    vars[`${varName}-desktop`] = `${scale.desktopPx}px`;
  }

  return vars as React.CSSProperties;
}

/**
 * Generate a <style> tag content for responsive typography.
 * Inject into the page head or a style element.
 */
export function getTypographyStyleTag(typography: TypographySettings, pageKey?: string): string {
  const defaults = typography.defaults;
  const pageOverride = pageKey ? typography.pages[pageKey] : undefined;

  function resolveScale(key: keyof typeof TYPOGRAPHY_VARS) {
    const base = defaults[key];
    const override = key !== 'navText' ? pageOverride?.[key as keyof PageTypographyOverride] : undefined;
    return {
      mobilePx: override?.mobilePx ?? base?.mobilePx ?? 14,
      desktopPx: override?.desktopPx ?? base?.desktopPx ?? 16,
    };
  }

  let css = '<style>';
  for (const key of Object.keys(TYPOGRAPHY_VARS) as (keyof typeof TYPOGRAPHY_VARS)[]) {
    const scale = resolveScale(key);
    const varName = TYPOGRAPHY_VARS[key];
    css += `${varName}: ${scale.mobilePx}px; `;
  }
  css += '@media (min-width: 768px) { ';
  for (const key of Object.keys(TYPOGRAPHY_VARS) as (keyof typeof TYPOGRAPHY_VARS)[]) {
    const scale = resolveScale(key);
    const varName = TYPOGRAPHY_VARS[key];
    css += `${varName}: ${scale.desktopPx}px; `;
  }
  css += '} </style>';
  return css;
}
