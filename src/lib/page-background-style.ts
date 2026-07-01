import type { CSSProperties } from 'react';
import type { PageBackgroundSetting } from './site-settings';

export function getPageBackgroundStyle(bg: PageBackgroundSetting | undefined): CSSProperties | undefined {
  if (!bg?.url || bg.mode !== 'image') return undefined;

  return {
    backgroundImage: `url(${bg.url})`,
    backgroundSize: bg.size,
    backgroundPosition: bg.position,
    backgroundRepeat: bg.repeat,
  };
}
