import { cn } from '@/lib/utils';

interface PlaceholderProps {
  aspectRatio?: string;
  label?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function Placeholder({
  aspectRatio = '1/1',
  label,
  variant = 'light',
  className,
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full flex items-center justify-center overflow-hidden',
        variant === 'light' ? 'bg-border' : 'bg-surface-dark',
        className,
      )}
      style={{ aspectRatio }}
      aria-hidden="true"
    >
      {label && (
        <span
          className={cn(
            'select-none text-badge font-sans',
            variant === 'light' ? 'text-muted-foreground' : 'text-on-dark/40',
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
