import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
        variant === 'default' && 'bg-foreground text-on-dark hover:bg-foreground/90',
        variant === 'ghost' && 'bg-transparent text-foreground hover:bg-foreground/5',
        size === 'sm' && 'text-badge px-3 py-1.5',
        size === 'md' && 'text-nav px-4 py-2',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
