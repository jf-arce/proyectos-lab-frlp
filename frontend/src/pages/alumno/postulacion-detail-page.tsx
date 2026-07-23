import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  FlaskConical,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { projectsService } from '@/services/projects';
import type { MyApplication } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillTag } from '@/components/ui/skill-tag';
import { StatusBadge, ESTADO_TO_STATUS } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectDetailSkeleton } from './components/project-detail-skeleton';

const estadoMensajes = {
  PENDIENTE:
    'Tu postulación fue enviada y aún no fue tomada para revisión. Te vamos a avisar cuando haya novedades.',
  EN_REVISION:
    'El laboratorio está revisando tu postulación. Te vamos a avisar cuando haya una decisión.',
  ACEPTADA:
    '¡Felicitaciones! Tu postulación fue aceptada. Contactá al laboratorio para coordinar los próximos pasos.',
  RECHAZADA:
    'Tu postulación no fue seleccionada esta vez. Podés seguir explorando otros proyectos.',
} as const;

const estadoTitulos = {
  PENDIENTE: 'Tu postulación fue enviada',
  EN_REVISION: 'Tu postulación está en revisión',
  ACEPTADA: 'Tu postulación fue aceptada',
  RECHAZADA: 'Tu postulación no fue seleccionada',
} as const;

// Clase de acento (token de estado) para el dot del hero
const estadoAccentClass = {
  PENDIENTE: 'status-pending',
  EN_REVISION: 'status-reviewing',
  ACEPTADA: 'status-accepted',
  RECHAZADA: 'status-rejected',
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PostulacionDetailPage() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<MyApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    projectsService
      .getMyApplicationById(token, id)
      .then((app) => {
        setApplication(app);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar la postulación',
        );
      })
      .finally(() => setIsLoading(false));
  }, [token, id]);

  async function handleWithdraw() {
    if (!token || !application) return;
    setIsWithdrawing(true);
    try {
      await projectsService.withdrawApplication(token, application.proyecto.id);
      toast.success('Postulación retirada exitosamente');
      navigate('/alumno/postulaciones');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al retirar la postulación',
      );
      setIsWithdrawing(false);
      setIsWithdrawDialogOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-destructive text-lg font-medium">
          {error ?? 'Postulación no encontrada'}
        </p>
        <Button variant="outline" asChild>
          <Link to="/alumno/postulaciones">
            <ArrowLeft className="size-4 mr-2" />
            Volver a mis postulaciones
          </Link>
        </Button>
      </div>
    );
  }

  const { proyecto } = application;
  const isPendiente = application.estado === 'PENDIENTE';
  const enRevision = application.estado === 'EN_REVISION';
  const isResuelta =
    application.estado === 'ACEPTADA' || application.estado === 'RECHAZADA';
  const canWithdraw = isPendiente || enRevision;
  const wasUpdated = application.updatedAt !== application.createdAt;

  return (
    <div className="space-y-6">
      <Link
        to="/alumno/postulaciones"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver a mis postulaciones
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Izquierda: estado de la postulación ── */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="py-0">
            <CardContent className="rounded-md p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'inline-flex size-2.5 shrink-0 rounded-full',
                    estadoAccentClass[application.estado],
                  )}
                  aria-hidden
                />
                <StatusBadge status={ESTADO_TO_STATUS[application.estado]} />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
                {estadoTitulos[application.estado]}
              </h1>

              <p className="text-muted-foreground leading-relaxed">
                {estadoMensajes[application.estado]}
              </p>

              {canWithdraw && (
                <div className="flex justify-end pt-1">
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setIsWithdrawDialogOpen(true)}
                  >
                    Retirar postulación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Timeline: recorrido de la postulación ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-primary" />
                Recorrido de tu postulación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-0">
                {/* Nodo 1 — Enviada (siempre completa) */}
                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary/30">
                      <Check className="size-4" />
                    </span>
                    <span
                      className={cn(
                        'w-px flex-1',
                        enRevision || isResuelta ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-foreground">
                      Postulación enviada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                </li>

                {/* Nodo 2 — En revisión */}
                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full ring-2',
                        enRevision || isResuelta
                          ? 'bg-primary text-primary-foreground ring-primary/30'
                          : 'bg-muted text-muted-foreground ring-border',
                      )}
                    >
                      {isResuelta ? (
                        <Check className="size-4" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </span>
                    <span
                      className={cn(
                        'w-px flex-1',
                        isResuelta ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  </div>
                  <div className="pb-6">
                    <p
                      className={cn(
                        'font-medium',
                        isPendiente
                          ? 'text-muted-foreground'
                          : 'text-foreground',
                      )}
                    >
                      Revisión del laboratorio
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPendiente
                        ? 'Pendiente de revisión'
                        : enRevision
                          ? 'En curso'
                          : 'Revisión completada'}
                    </p>
                  </div>
                </li>

                {/* Nodo 3 — Resultado */}
                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full ring-2 ring-border',
                        isResuelta
                          ? estadoAccentClass[application.estado]
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {application.estado === 'ACEPTADA' ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                  </div>
                  <div>
                    <p
                      className={cn(
                        'font-medium',
                        isResuelta
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {application.estado === 'ACEPTADA'
                        ? 'Aceptada'
                        : application.estado === 'RECHAZADA'
                          ? 'No seleccionada'
                          : 'Resultado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isResuelta && wasUpdated
                        ? formatDate(application.updatedAt)
                        : 'Pendiente de resolución'}
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Proyecto */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ESTADO_TO_STATUS[proyecto.estado]} />
                {proyecto.duracion && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" />
                    {proyecto.duracion} de duración
                  </Badge>
                )}
              </div>

              <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug tracking-tight">
                {proyecto.titulo}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {proyecto.descripcion}
              </p>

              {proyecto.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {proyecto.skills.map((skill) => (
                    <SkillTag key={skill.id}>{skill.nombre}</SkillTag>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" asChild>
                <Link to={`/alumno/proyecto/${proyecto.id}`}>
                  Ver proyecto completo
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Laboratorio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4 text-primary" />
                Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-foreground">
                {proyecto.laboratorio.nombre}
              </p>
              {proyecto.laboratorio.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {proyecto.laboratorio.descripcion}
                </p>
              )}
              {proyecto.laboratorio.emailContacto && (
                <a
                  href={`mailto:${proyecto.laboratorio.emailContacto}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline pt-1"
                >
                  <Mail className="size-3.5" />
                  {proyecto.laboratorio.emailContacto}
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Retirar postulación?</DialogTitle>
            <DialogDescription>
              Vas a retirar tu postulación al proyecto "{proyecto.titulo}". Esta
              acción no se puede deshacer, pero podés volver a postularte más
              adelante si el proyecto sigue activo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isWithdrawing}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? 'Retirando...' : 'Retirar postulación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
