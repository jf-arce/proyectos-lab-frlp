# Módulo 4: Exploración y Postulación Online

## Descripción

Es la cara pública de la plataforma para los alumnos. Permite descubrir todos los proyectos activos publicados por los laboratorios, aplicar filtros para encontrar los más relevantes, ver el detalle de cada uno y postularse con un solo clic. También centraliza el historial de postulaciones del alumno para que pueda hacer seguimiento del estado de cada una.

## Funcionalidades a implementar

### Listado de proyectos activos

- Endpoint público (o autenticado) que devuelve todos los proyectos con `status = ACTIVE`.
- Soporte para **filtros combinables**:
  - Por laboratorio (`laboratoryId`)
  - Por habilidades requeridas (`skillIds[]`) — proyectos que incluyan al menos una de las habilidades indicadas
  - Por texto libre (búsqueda en título y descripción)
- Paginación con `limit` y `offset` (o cursor-based si se prefiere).
- La respuesta incluye datos básicos del proyecto y del laboratorio (nombre, logo si existe).

### Vista de detalle de proyecto

- Endpoint `GET /projects/:id` (rol `ALUMNO`) que devuelve la información completa: título, descripción, cupo, duracion, laboratorio (nombre, descripción, emailContacto), habilidades requeridas, fecha de publicación.
- Para determinar si el alumno ya se postuló, el frontend llama en paralelo a `GET /applications/my` y verifica si alguna postulación corresponde al proyecto actual. El endpoint de detalle no incluye `hasApplied` en su respuesta.

### Postulación con un clic ✅ (implementado)

- Endpoint `POST /projects/:id/apply` (rol `ALUMNO`).
- El backend obtiene el perfil completo del alumno desde la BD y crea el registro `Postulacion` vinculado al alumno y al proyecto.
- Validaciones (implementadas en `postulaciones.service.ts` → `postular()`):
  - El proyecto debe estar `ACTIVO` (si no, `400`).
  - El alumno no puede postularse dos veces al mismo proyecto (`409 Conflict`).
  - El cupo no debe estar completo: postulaciones `ACEPTADA` < `cupos` (si está lleno, `400`). **Excepción:** `cupos = 0` se interpreta como "sin límite definido" y no se valida cupo, porque es el default de la entity y el valor de los proyectos existentes.
- Tras crear la postulación, se dispara la notificación al responsable del laboratorio vía evento `POSTULACION_CREADA` (Módulo 5).

### Historial de postulaciones del alumno ✅ (implementado)

- Endpoint `GET /applications/my` que lista todas las postulaciones del alumno autenticado.
- Incluye datos del proyecto (título, laboratorio con `emailContacto`, skills) y el estado actual (`PENDIENTE`, `EN_REVISION`, `ACEPTADA`, `RECHAZADA`).
- Ordenado por fecha de postulación descendente. Sin paginación ni filtros de backend: el frontend filtra client-side (por estado y por texto en título de proyecto / nombre de laboratorio).
- Frontend: `/alumno/postulaciones` (listado en cards) y `/alumno/postulaciones/:id` (detalle con seguimiento del estado, datos del proyecto, contacto del laboratorio y acción de retirar).

### Detalle de una postulación ✅ (implementado)

- Endpoint `GET /applications/:id` (rol `ALUMNO`) que devuelve una postulación propia con el proyecto completo (laboratorio y skills incluidos).
- Si la postulación no existe o pertenece a otro alumno, responde `404` (no se revela existencia ajena).

### Retirar postulación ✅ (implementado)

- Endpoint `DELETE /projects/:id/apply` (rol `ALUMNO`), donde `:id` es el id del **proyecto**.
- Se permite mientras la postulación está `PENDIENTE` o `EN_REVISION`; una vez resuelta (`ACEPTADA` / `RECHAZADA`) responde `400`.
- Es un borrado físico: el alumno puede volver a postularse al mismo proyecto después de retirarse.

### Estados de la postulación (máquina de estados)

```
PENDIENTE ─┬─▶ EN_REVISION ─▶ ACEPTADA / RECHAZADA
           └────────────────▶ ACEPTADA / RECHAZADA   (el paso EN_REVISION es opcional)
```

- `EN_REVISION` lo marca **manualmente** el responsable desde su panel (botón "Marcar en revisión") cuando empieza a evaluar la postulación. Es opcional: puede aceptar/rechazar directo desde `PENDIENTE`.
- `ACEPTADA` y `RECHAZADA` son **terminales**: no se pueden modificar (responde `400`). Tampoco se puede volver a `PENDIENTE`.
- Cada transición dispara notificación al alumno (Módulo 5), incluida la de entrada a `EN_REVISION`.
- Cupos: solo las postulaciones `ACEPTADA` consumen cupo; `EN_REVISION` no reserva cupo.
- En el detalle del alumno (`/alumno/postulaciones/:id`), el timeline refleja estos estados: "Enviada" (siempre), "Revisión del laboratorio" (activa en `EN_REVISION`, completa al resolverse) y "Resultado".

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/projects` | ALUMNO | Listar proyectos activos con filtros |
| `GET` | `/projects/:id` | ALUMNO | Detalle de un proyecto |
| `POST` | `/projects/:id/apply` | ALUMNO | Postularse a un proyecto |
| `DELETE` | `/projects/:id/apply` | ALUMNO | Retirar postulación (`PENDIENTE` o `EN_REVISION`, borrado físico) |
| `GET` | `/applications/my` | ALUMNO | Historial de postulaciones |
| `GET` | `/applications/:id` | ALUMNO | Detalle de una postulación propia |

## Estructura de código sugerida

### Backend

El listado y detalle de proyectos se implementan en `projects.controller.ts` (módulo de proyectos), pero los endpoints orientados al alumno conviene separarlos en un controlador propio o en rutas diferenciadas dentro del mismo módulo.

```
projects/
└── projects.controller.ts
    # GET /projects          → público
    # GET /projects/:id      → público
    # POST /projects/:id/apply → ALUMNO
    # DELETE /projects/:id/apply → ALUMNO (opcional)

applications/
├── applications.module.ts
├── applications.controller.ts   # GET /applications/my
└── applications.service.ts
```

### Query con filtros (TypeORM QueryBuilder)

```typescript
const query = this.projectRepo.createQueryBuilder('project')
  .leftJoinAndSelect('project.laboratory', 'lab')
  .leftJoinAndSelect('project.skills', 'skill')
  .where('project.status = :status', { status: 'ACTIVE' });

if (filters.laboratoryId) {
  query.andWhere('lab.id = :labId', { labId: filters.laboratoryId });
}
if (filters.skillIds?.length) {
  query.andWhere('skill.id IN (:...skillIds)', { skillIds: filters.skillIds });
}
if (filters.search) {
  query.andWhere(
    '(project.title ILIKE :q OR project.description ILIKE :q)',
    { q: `%${filters.search}%` },
  );
}
```

### Frontend — `src/`

```
pages/
└── alumno/
    ├── dashboard-page.tsx          # /alumno/dashboard — exploración y recomendaciones
    ├── project-detail-page.tsx     # /alumno/proyecto/:id — detalle + botón postularse
    ├── postulaciones-page.tsx      # /alumno/postulaciones — historial del alumno
    ├── postulacion-detail-page.tsx # /alumno/postulaciones/:id — detalle y seguimiento
    ├── labs-page.tsx               # /alumno/laboratorios — listado de laboratorios
    └── lab-detail-page.tsx         # /alumno/laboratorios/:id — detalle de un lab

services/
└── projects.ts                     # findAll, findById, getMyApplications,
                                    # getMyApplicationById, applyToProject, withdrawApplication
```

## Consideraciones

- El botón "Postularse" debe desactivarse si: el alumno ya se postuló, el proyecto está cerrado, o el cupo está lleno.
- Para mostrar correctamente `hasApplied`, la página de detalle llama en paralelo a `GET /projects/:id` y `GET /applications/my`, y deriva el estado localmente. Esto reutiliza el endpoint de historial y evita exponer datos de postulaciones en la respuesta del proyecto.
- El historial de postulaciones es el punto de contacto del alumno con el estado actualizado por el responsable — es importante que se actualice en tiempo razonable (polling o websockets según se decida en Módulo 5).
- Considerar añadir un índice en `(student_id, project_id)` en la tabla `applications` para acelerar la verificación de duplicados.
