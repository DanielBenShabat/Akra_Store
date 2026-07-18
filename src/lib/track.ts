'use client';

// Thin wrapper around the Umami tracking script's custom-event API, used for
// funnel steps that have no page of their own (add-to-cart, checkout submit).
// The public tracking script (loaded in the storefront layout) exposes
// `window.umami`; across versions it's been either a bare function or an object
// with a `.track` method, so tolerate both. A no-op when the script isn't
// present — analytics must never break a user flow.
type UmamiTrack = (event: string, data?: Record<string, unknown>) => void;

declare global {
  interface Window {
    umami?: UmamiTrack | { track: UmamiTrack };
  }
}

export function track(event: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const umami = window.umami;
  if (!umami) return;
  try {
    if (typeof umami === 'function') umami(event, data);
    else umami.track(event, data);
  } catch {
    // Swallow — a tracking failure should never surface to the shopper.
  }
}
