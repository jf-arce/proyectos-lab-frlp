import { useState } from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types/auth';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isResponsable = user?.role === Role.RESPONSABLE_LABORATORIO;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_POSTULACION':
        return <AlertCircle className="size-4" />;
      case 'ESTADO_ACTUALIZADO':
        return <CheckCircle2 className="size-4" />;
      default:
        return <Bell className="size-4" />;
    }
  };

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_POSTULACION':
        return 'text-amber-600';
      case 'ESTADO_ACTUALIZADO':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleReviewApplication = async (notification: {
    id: string;
    leida: boolean;
    postulacion: { proyecto: { id: string } } | null;
  }) => {
    if (!notification.postulacion) return;
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    navigate('/responsable/dashboard', {
      state: { openApplicantsForProjectId: notification.postulacion.proyecto.id },
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-4"
          title="Notificaciones"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="size-3.5 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                No hay notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 transition-colors hover:bg-muted/30',
                    !notification.leida ? 'bg-primary/5' : 'bg-background',
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 mt-1',
                        getIconColor(notification.tipo),
                      )}
                    >
                      {getIcon(notification.tipo)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-3">
                        {notification.mensaje}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {isResponsable &&
                          notification.tipo === 'NUEVA_POSTULACION' &&
                          notification.postulacion && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-auto px-1.5 py-1 text-xs font-semibold"
                              onClick={() => handleReviewApplication(notification)}
                            >
                              Revisar postulación
                              <ArrowRight className="size-3.5 ml-1" />
                            </Button>
                          )}

                        {/* Mark as read button */}
                        {!notification.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-1.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            <CheckCheck className="size-3.5 mr-1" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.leida && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Link to all notifications (opcional) */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="px-4 py-2 text-center">
              <a
                href="/alumno/notificaciones"
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                Ver todas las notificaciones
              </a>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
