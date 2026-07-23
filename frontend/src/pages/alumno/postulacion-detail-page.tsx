import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FlaskConical,
  Mail,
} from 'lucide-react';
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
    'El laboratorio todavía no revisó tu postulación. Te vamos a avisar cuando haya novedades.',
  ACEPTADA:
    '¡Felicitaciones! Tu postulación fue aceptada. Contactá al laboratorio para coordinar los próximos pasos.',
  RECHAZADA:
    'Tu postulación no fue seleccionada esta vez. Podés seguir explorando otros proyectos.',
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
        {/* ── Left column: datos del proyecto y laboratorio ── */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={ESTADO_TO_STATUS[proyecto.estado]} />
                {proyecto.duracion && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" />
                    {proyecto.duracion} de duración
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                {proyecto.titulo}
              </h1>

              <p className="text-muted-foreground leading-relaxed text-base">
                {proyecto.descripcion}
              </p>

              {proyecto.skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Habilidades requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {proyecto.skills.map((skill) => (
                      <SkillTag key={skill.id}>{skill.nombre}</SkillTag>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" asChild>
                <Link to={`/alumno/proyecto/${proyecto.id}`}>
                  Ver proyecto completo
                </Link>
              </Button>
            </CardContent>
          </Card>

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
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Mail className="size-3.5" />
                  {proyecto.laboratorio.emailContacto}
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar: seguimiento y acciones ── */}
        <div className="lg:col-span-4 lg:sticky top-24 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Seguimiento de tu postulación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Estado actual
                </span>
                <StatusBadge status={ESTADO_TO_STATUS[application.estado]} />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-md p-3">
                {estadoMensajes[application.estado]}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" />
                  <span>
                    Postulado el{' '}
                    <span className="font-medium text-foreground">
                      {formatDate(application.createdAt)}
                    </span>
                  </span>
                </div>
                {wasUpdated && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <span>
                      Última actualización el{' '}
                      <span className="font-medium text-foreground">
                        {formatDate(application.updatedAt)}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {isPendiente && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setIsWithdrawDialogOpen(true)}
                >
                  Retirar postulación
                </Button>
              )}
            </CardContent>
          </Card>

          {proyecto.laboratorio.emailContacto && (
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="space-y-2">
                <p className="font-semibold text-sm">¿Consultas?</p>
                <p className="text-xs opacity-80">
                  Contactá al equipo del laboratorio para resolver dudas sobre
                  tu postulación.
                </p>
                <a
                  href={`mailto:${proyecto.laboratorio.emailContacto}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline mt-1"
                >
                  <Mail className="size-3.5" />
                  {proyecto.laboratorio.emailContacto}
                </a>
              </CardContent>
            </Card>
          )}
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
