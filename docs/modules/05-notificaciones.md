# Módulo 5: Notificaciones

## Descripción

Mantiene informados a los usuarios sobre eventos relevantes sin que tengan que volver a revisar la plataforma activamente. Hay dos canales: notificaciones **in-app** (visibles dentro de la plataforma) y **notificaciones por email** para eventos clave.

Los dos eventos principales que generan notificaciones son:

1. **Alumno recibe respuesta** a su postulación (ACCEPTED / REJECTED) → notificación al alumno.
2. **Responsable recibe nueva postulación** en uno de sus proyectos → notificación al responsable.

## Funcionalidades a implementar

### Notificaciones in-app

- Entidad `Notification` que guarda cada notificación en BD con: destinatario, tipo, mensaje, referencia al recurso (`projectId`, `applicationId`), y estado de lectura (`read: boolean`).
- Endpoint `GET /notifications` que devuelve las notificaciones del usuario autenticado, ordenadas por fecha descendente.
- Endpoint `PATCH /notifications/:id/read` para marcarla como leída.
- Endpoint `PATCH /notifications/read-all` para marcar todas como leídas.
- En el header de la aplicación, mostrar un ícono de campana con un **badge numérico** de notificaciones no leídas.
- Polling periódico (cada 30–60 s) desde el frontend para refrescar el conteo, o alternativamente SSE / WebSockets si se quiere tiempo real.

### Notificaciones por email

- Al producirse un evento clave, enviar un email al destinatario usando **Nodemailer** (o el proveedor SMTP configurado).
- Emails a implementar:
  - Al alumno: "Tu postulación al proyecto _[título]_ fue **aceptada/rechazada**."
  - Al responsable: "El alumno _[nombre]_ se postuló al proyecto _[título]_."
- Las plantillas pueden ser HTML simples o construidas con una librería como `handlebars`.
- El envío de email debe ser **asíncrono** y no bloquear la respuesta HTTP (usar `EventEmitter2` o una queue).

### Generación de notificaciones (integración con otros módulos)

Las notificaciones se crean como efecto secundario de acciones en otros módulos:

| Evento | Módulo origen | Notificación generada |
|--------|---------------|-----------------------|
| Responsable cambia estado de postulación a ACCEPTED/REJECTED | Módulo 3 | Notificación al alumno |
| Alumno se postula a un proyecto | Módulo 4 | Notificación al responsable |

El desacoplamiento se logra con el sistema de eventos de NestJS (`EventEmitter2`). El módulo de notificaciones escucha los eventos y actúa:

```typescript
// En projects.service.ts (emisión)
this.eventEmitter.emit('application.status.changed', { applicationId, studentId, newStatus, projectTitle });

// En notifications.listener.ts (recepción)
@OnEvent('application.status.changed')
async handleStatusChanged(payload: ApplicationStatusChangedEvent) {
  await this.notificationsService.create({ ... });
  await this.emailService.send({ ... });
}
```

## Estructura de código sugerida

### Backend — `src/modules/notifications/`

```
notifications/
├── notifications.module.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.listener.ts    # @OnEvent handlers
├── email.service.ts             # encapsula el envío con Nodemailer
├── entities/
│   └── notification.entity.ts
└── dto/
    └── create-notification.dto.ts
```

### Entidad `Notification`

```typescript
@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  recipient: User;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;    // APPLICATION_STATUS_CHANGED | NEW_APPLICATION

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  applicationId: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Frontend — `src/`

```
components/layout/
└── NotificationBell.tsx       # ícono en el header con badge de no leídas

components/notifications/
├── NotificationList.tsx       # dropdown o panel de notificaciones
└── NotificationItem.tsx       # ítem individual con link al recurso

hooks/
└── useNotifications.ts        # polling + marcar como leída
```

## Paquetes requeridos

### Backend

```bash
npm install @nestjs/event-emitter nodemailer
npm install -D @types/nodemailer
# Opcional para plantillas:
npm install handlebars
```

## Variables de entorno requeridas (backend)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASS=password
SMTP_FROM="Portal Lab FRLP <no-reply@example.com>"
```

## Consideraciones

- El envío de email debe fallar silenciosamente (log del error sin lanzar excepción) para no afectar la operación principal.
- Para MVP, el polling desde el frontend cada 30 s es suficiente. Si se decide tiempo real, usar **Server-Sent Events (SSE)** con el decorador `@Sse()` de NestJS — es más simple que WebSockets para este caso de uso unidireccional.
- Considerar un límite de notificaciones mostradas (últimas 50) y limpieza periódica de notificaciones antiguas leídas.
- En `notifications.module.ts`, importar `EventEmitterModule` desde el módulo raíz y asegurarse de que `EventEmitter2` esté disponible globalmente.
