import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  icon: React.ReactNode;
}

export function IconButton({
  'aria-label': ariaLabel,
  icon,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center p-2 shrink-0',
        'text-foreground transition-colors hover:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
