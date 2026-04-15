import { cn } from '@/lib/utils';

type Status = 'pending' | 'accepted' | 'rejected' | 'active' | 'closed';

const config: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'status-pending' },
  accepted: { label: 'Aceptado', className: 'status-accepted' },
  rejected: { label: 'Rechazado', className: 'status-rejected' },
  active: { label: 'Activo', className: 'bg-primary/10 text-primary' },
  closed: { label: 'Cerrado', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  );
}
