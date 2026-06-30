import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Rendered height in px (width scales with the logo's aspect ratio). */
  height?: number;
  className?: string;
  priority?: boolean;
  src?: string | null;
}

// Intrinsic dimensions of public/logo.png (the processed brand mark).
const LOGO_W = 1024;
const LOGO_H = 897;

/**
 * Single source of truth for the AKRA brand mark. Swap the asset here to change
 * it everywhere. The PNG has a transparent background so it reads on both the
 * light header and the dark hero.
 */
export function Logo({ height = 32, className, priority, src }: LogoProps) {
  const width = Math.round((LOGO_W / LOGO_H) * height);
  return (
    <Image
      src={src || '/logo.png'}
      alt="AKRA"
      width={width}
      height={height}
      priority={priority}
      className={cn('select-none object-contain', className)}
    />
  );
}
