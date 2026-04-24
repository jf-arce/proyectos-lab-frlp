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

### Postulación con un clic

- Endpoint `POST /projects/:id/apply` (rol `ALUMNO`).
- El backend obtiene el perfil completo del alumno desde la BD y crea el registro `Application` vinculado al alumno y al proyecto.
- Validaciones:
  - El proyecto debe estar `ACTIVE`.
  - El alumno no puede postularse dos veces al mismo proyecto (retornar `409 Conflict`).
  - Verificar que el cupo no esté completo (postulaciones `ACCEPTED` < `capacity`).
- Tras crear la postulación, disparar notificación al responsable del laboratorio (Módulo 5).

### Historial de postulaciones del alumno

- Endpoint `GET /applications/my` que lista todas las postulaciones del alumno autenticado.
- Incluye datos del proyecto (título, laboratorio) y el estado actual (`PENDING`, `ACCEPTED`, `REJECTED`).
- Ordenado por fecha de postulación descendente.

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/projects` | ALUMNO | Listar proyectos activos con filtros |
| `GET` | `/projects/:id` | ALUMNO | Detalle de un proyecto |
| `POST` | `/projects/:id/apply` | ALUMNO | Postularse a un proyecto |
| `DELETE` | `/projects/:id/apply` | ALUMNO | Retirar postulación (opcional) |
| `GET` | `/applications/my` | ALUMNO | Historial de postulaciones |

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
    ├── labs-page.tsx               # /alumno/laboratorios — listado de laboratorios
    └── lab-detail-page.tsx         # /alumno/laboratorios/:id — detalle de un lab

services/
└── projects.ts                     # findAll, findById, getMyApplications, applyToProject
```

## Consideraciones

- El botón "Postularse" debe desactivarse si: el alumno ya se postuló, el proyecto está cerrado, o el cupo está lleno.
- Para mostrar correctamente `hasApplied`, la página de detalle llama en paralelo a `GET /projects/:id` y `GET /applications/my`, y deriva el estado localmente. Esto reutiliza el endpoint de historial y evita exponer datos de postulaciones en la respuesta del proyecto.
- El historial de postulaciones es el punto de contacto del alumno con el estado actualizado por el responsable — es importante que se actualice en tiempo razonable (polling o websockets según se decida en Módulo 5).
- Considerar añadir un índice en `(student_id, project_id)` en la tabla `applications` para acelerar la verificación de duplicados.
