# Módulo 3: Gestión de Proyectos por Laboratorio

## Descripción

Permite a los responsables de laboratorio publicar, editar y administrar los proyectos de su laboratorio. Es el módulo que alimenta de contenido a toda la plataforma: sin proyectos publicados, los alumnos no tienen nada que explorar ni a qué postularse.

Cada responsable solo puede gestionar los proyectos del laboratorio al que está vinculado (el `laboratoryId` proviene del JWT, no del request).

## Funcionalidades a implementar

### CRUD de proyectos

Un proyecto tiene los siguientes atributos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | string | Nombre del proyecto |
| `description` | text | Descripción detallada |
| `requirements` | text | Requisitos adicionales en texto libre |
| `capacity` | number | Cupos disponibles |
| `status` | enum | `ACTIVE` \| `CLOSED` |
| `laboratory` | relación | Laboratorio al que pertenece |
| `skills` | relación M:N | Habilidades requeridas (tags) |

### Endpoints de gestión (rol RESPONSABLE_LABORATORIO)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/projects` | Crear un proyecto nuevo |
| `PUT` | `/projects/:id` | Editar un proyecto existente |
| `DELETE` | `/projects/:id` | Eliminar un proyecto |
| `PATCH` | `/projects/:id/status` | Cambiar estado (ACTIVE / CLOSED) |
| `GET` | `/projects/my` | Listar proyectos del propio laboratorio |

### Gestión de postulaciones recibidas

Desde el panel del responsable, puede ver las postulaciones a cada proyecto y cambiar su estado:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/projects/:id/applications` | Ver postulaciones de un proyecto |
| `PATCH` | `/applications/:id/status` | Cambiar estado: `PENDING` → `ACCEPTED` \| `REJECTED` |

Al cambiar el estado de una postulación, se dispara una notificación al alumno (Módulo 5).

### Control de acceso

- Un responsable **solo puede editar, eliminar o ver las postulaciones** de proyectos que pertenecen a su propio laboratorio.
- Validar en el servicio que `project.laboratoryId === user.laboratoryId`; si no coincide, lanzar `ForbiddenException`.

## Estructura de código sugerida

### Backend — `src/modules/projects/`

```
projects/
├── projects.module.ts
├── projects.controller.ts
├── projects.service.ts
├── entities/
│   ├── project.entity.ts
│   └── application.entity.ts    # postulación (alumno → proyecto)
└── dto/
    ├── create-project.dto.ts
    ├── update-project.dto.ts
    └── update-application-status.dto.ts
```

### Entidad `Project`

```typescript
@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column()
  capacity: number;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @ManyToOne(() => Laboratory, { eager: true })
  laboratory: Laboratory;

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  skills: Skill[];

  @OneToMany(() => Application, (app) => app.project)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### Entidad `Application`

```typescript
@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Project, (p) => p.applications)
  project: Project;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;    // PENDING | ACCEPTED | REJECTED

  @CreateDateColumn()
  appliedAt: Date;
}
```

### Frontend — `src/`

```
pages/
└── lab/
    ├── LabDashboardPage.tsx         # panel principal del responsable
    ├── ProjectFormPage.tsx          # crear / editar proyecto
    └── ProjectApplicationsPage.tsx  # ver postulaciones de un proyecto

components/lab/
├── ProjectCard.tsx                  # tarjeta de proyecto en el dashboard
├── ApplicationRow.tsx               # fila de postulación con botones de acción
└── SkillsSelector.tsx               # selector de habilidades requeridas
```

## Entidad: `Laboratory`

Los laboratorios son entidades de referencia, generalmente precargadas (seed). Cada responsable queda vinculado a uno al registrarse.

```
src/modules/laboratories/
├── laboratories.module.ts
├── laboratories.controller.ts   # GET /laboratories (listado público para registro)
├── laboratories.service.ts
└── entities/
    └── laboratory.entity.ts     # { id, name, description, contactEmail }
```

## Consideraciones

- Al cerrar un proyecto (`CLOSED`), las postulaciones pendientes deben mantenerse en la base de datos para historial, pero el proyecto debe desaparecer de las sugerencias y del listado público de activos.
- El cambio de estado de postulación es el evento que dispara las notificaciones del Módulo 5 — el servicio de projects debe llamar al servicio de notifications (o emitir un evento interno con EventEmitter2).
- Usar `EventEmitter2` de NestJS para desacoplar la lógica de notificaciones del servicio de proyectos.
