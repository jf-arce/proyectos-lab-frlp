import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTagProps {
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function SkillTag({
  children,
  removable,
  onRemove,
  className,
}: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        'bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full hover:bg-primary/10 p-0.5"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
