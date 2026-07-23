import { cn } from '@/lib/utils';

export function getLabInitials(nombre: string): string {
  const words = nombre.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface LabMonogramProps {
  nombre: string;
  /** 'muted' para superficies claras (cards), 'onPrimary' para el hero primary. */
  variant?: 'muted' | 'onPrimary';
  size?: 'md' | 'lg';
  className?: string;
}

export function LabMonogram({
  nombre,
  variant = 'muted',
  size = 'md',
  className,
}: LabMonogramProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md font-display font-bold shrink-0',
        variant === 'muted'
          ? 'bg-primary/10 text-primary'
          : 'bg-primary-foreground/10 text-primary-foreground',
        size === 'md' ? 'size-12 text-lg' : 'size-16 text-2xl',
        className,
      )}
      aria-hidden
    >
      {getLabInitials(nombre)}
    </div>
  );
}
