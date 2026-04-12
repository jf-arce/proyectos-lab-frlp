# Módulo 3: Gestión de Proyectos por Laboratorio

## Descripción

Permite a los responsables de laboratorio publicar, editar y administrar los proyectos de su laboratorio. Es el módulo que alimenta de contenido a toda la plataforma: sin proyectos publicados, los alumnos no tienen nada que explorar ni a qué postularse.

Cada responsable solo puede gestionar los proyectos del laboratorio al que está vinculado (el `laboratoryId` proviene del JWT, no del request).

## Funcionalidades a implementar

### CRUD de proyectos

Un proyecto tiene los siguientes atributos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | string | Nombre del proyecto |
| `descripcion` | text | Descripción detallada |
| `estado` | enum | `ACTIVO` \| `CERRADO` |
| `laboratorio` | relación | Laboratorio al que pertenece |
| `skills` | relación M:N | Habilidades requeridas (tags) |

### Endpoints de gestión (rol RESPONSABLE_LABORATORIO)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/projects` | Crear un proyecto nuevo |
| `PUT` | `/projects/:id` | Editar un proyecto existente |
| `DELETE` | `/projects/:id` | Eliminar un proyecto |
| `PATCH` | `/projects/:id/status` | Cambiar estado (ACTIVO / CERRADO) |
| `GET` | `/projects/my` | Listar proyectos del propio laboratorio |

### Gestión de postulaciones recibidas

Desde el panel del responsable, puede ver las postulaciones a cada proyecto y cambiar su estado:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/projects/:id/applications` | Ver postulaciones de un proyecto |
| `PATCH` | `/applications/:id/status` | Cambiar estado: `PENDIENTE` → `ACEPTADA` \| `RECHAZADA` |

Al cambiar el estado de una postulación, se dispara una notificación al alumno (Módulo 5).

### Control de acceso

- Un responsable **solo puede editar, eliminar o ver las postulaciones** de proyectos que pertenecen a su propio laboratorio.
- Validar en el servicio que `project.laboratoryId === user.laboratoryId`; si no coincide, lanzar `ForbiddenException`.

## Estructura de código sugerida

### Backend — `src/modules/proyectos/`

```
proyectos/
├── proyectos.module.ts
├── proyectos.controller.ts
├── proyectos.service.ts
├── entities/
│   ├── proyecto.entity.ts
│   └── postulacion.entity.ts
└── dto/
    ├── create-proyecto.dto.ts
    ├── update-proyecto.dto.ts
    └── update-postulacion-estado.dto.ts
```

### Entidad `Proyecto`

```typescript
@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'enum', enum: ProyectoEstado, default: ProyectoEstado.ACTIVO })
  estado: ProyectoEstado;

  @ManyToOne(() => Laboratorio, { eager: true })
  laboratorio: Laboratorio;

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  skills: Skill[];

  @OneToMany(() => Postulacion, (p) => p.proyecto)
  postulaciones: Postulacion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entidad `Postulacion`

```typescript
@Entity()
export class Postulacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Alumno)
  alumno: Alumno;

  @ManyToOne(() => Proyecto, (p) => p.postulaciones)
  proyecto: Proyecto;

  @Column({ type: 'enum', enum: PostulacionEstado, default: PostulacionEstado.PENDIENTE })
  estado: PostulacionEstado;    // PENDIENTE | ACEPTADA | RECHAZADA

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
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
src/modules/laboratorios/
├── laboratorios.module.ts
├── laboratorios.controller.ts   # GET /laboratorios (listado público para registro)
├── laboratorios.service.ts
└── entities/
    └── laboratorio.entity.ts    # { id, nombre, descripcion, emailContacto }
```

## Consideraciones

- Al cerrar un proyecto (`CERRADO`), las postulaciones pendientes deben mantenerse en la base de datos para historial, pero el proyecto debe desaparecer de las sugerencias y del listado público de activos.
- El cambio de estado de postulación es el evento que dispara las notificaciones del Módulo 5 — el servicio de proyectos debe emitir un evento interno con `EventEmitter2` para desacoplar la lógica de notificaciones.
- Usar `EventEmitter2` de NestJS para desacoplar la lógica de notificaciones del servicio de proyectos.
