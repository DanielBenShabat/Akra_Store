import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Register the custom font-size utilities from globals.css (@theme) so
// tailwind-merge classifies them as font-sizes rather than conflating them
// with text-color utilities. Without this, e.g. cn('text-on-dark','text-nav')
// drops the color and produces black-on-black text.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['nav', 'section-title', 'product-title', 'price', 'badge', 'view-all'] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, symbol: string): string {
  return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * URL-safe slug from a category name. Drops apostrophes (incl. the curly ’)
 * so "TAMAR’S" → "tamars", collapses other punctuation/space to single
 * dashes, and trims edge dashes. Falls back to 'category' if nothing remains.
 */
export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'category';
}
