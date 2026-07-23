import { cn } from '@/lib/utils';

export type Status =
  | 'pending'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'active'
  | 'closed';

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'status-pending' },
  reviewing: { label: 'En revisión', className: 'status-reviewing' },
  accepted: { label: 'Aceptada', className: 'status-accepted' },
  rejected: { label: 'Rechazada', className: 'status-rejected' },
  active: { label: 'Activo', className: 'status-accepted' },
  closed: { label: 'Cerrado', className: 'status-rejected' },
};

// Mapea los estados que devuelve el backend al prop `status`
export const ESTADO_TO_STATUS = {
  PENDIENTE: 'pending',
  EN_REVISION: 'reviewing',
  ACEPTADA: 'accepted',
  RECHAZADA: 'rejected',
  ACTIVO: 'active',
  CERRADO: 'closed',
} as const satisfies Record<string, Status>;

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { label, className: statusClass } = statusConfig[status];

  return (
    <span
      data-slot="status-badge"
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        statusClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
