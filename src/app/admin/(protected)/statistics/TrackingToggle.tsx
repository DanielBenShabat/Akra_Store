'use client';

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

// Umami's tracker skips sending anything when localStorage['umami.disabled']
// holds ANY non-empty string — verified in script.js, which truthy-checks
// `getItem("umami.disabled")`. So we set '1' to disable and REMOVE the key to
// re-enable; setting '0' would still read as truthy and stay disabled.
//
// The flag is scoped to the localStorage origin (akrastudioz.com), which the
// storefront tracker shares with this admin page — so flipping it here silences
// tracking when the owner later browses the store in the same browser. It is
// per-browser and clears if the owner clears site data.
const KEY = 'umami.disabled';

// Read the flag through useSyncExternalStore so the value is hydration-safe
// (server renders "tracked", client reconciles to the real localStorage value
// without a mismatch) and same-tab toggles re-render via our own notifier.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

function setExcluded(next: boolean): void {
  try {
    if (next) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* localStorage unavailable — nothing we can do */
  }
  // 'storage' events don't fire in the tab that made the change, so notify ours.
  listeners.forEach((l) => l());
}

export function TrackingToggle() {
  const excluded = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Don&apos;t track this device</h2>
        <p className="text-xs text-muted-foreground">
          Turn on when you browse the store on your own device, so owner visits don&apos;t inflate
          the numbers. Applies to <span className="font-medium">this browser only</span> — turn it
          on for each device/browser you use, and it resets if you clear site data.
        </p>
        <p className="pt-0.5 text-xs">
          {excluded ? (
            <span className="font-medium text-accent-warning">
              This device is excluded from analytics.
            </span>
          ) : (
            <span className="text-muted-foreground">This device is currently being tracked.</span>
          )}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={excluded}
        aria-label="Don't track this device"
        onClick={() => setExcluded(!excluded)}
        className={cn(
          'relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors',
          excluded ? 'bg-foreground' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform',
            excluded ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
