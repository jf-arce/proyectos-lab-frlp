# Sección de Laboratorios (vista del alumno)

Flujo de exploración por laboratorio para el rol `ALUMNO`. Completa las páginas
que antes eran stubs vacíos (`return null`) y agrega la vista de proyectos por
laboratorio.

## Flujo y rutas

| Pantalla | Ruta | Página | Descripción |
|---|---|---|---|
| 1. Listado de labs | `/alumno/laboratorios` | `LaboratoriosPage` (`src/pages/alumno/labs-page.tsx`) | Grid de cards grandes con todos los laboratorios. El alumno elige uno. |
| 2. Hero del lab | `/alumno/laboratorios/:id` | `LaboratorioDetailPage` (`src/pages/alumno/lab-detail-page.tsx`) | Banda inmersiva `bg-primary` con monograma, nombre, descripción, contacto y CTA **"Ver proyectos"**. Debajo, preview real de hasta 3 proyectos activos del lab con link "Ver todos". |
| 3. Proyectos del lab | `/alumno/laboratorios/:id/proyectos` | `LabProyectosPage` (`src/pages/alumno/lab-projects-page.tsx`) | Lista los proyectos activos del laboratorio con barra de filtros (búsqueda + skills) y paginación "Mostrar más". |

Las tres rutas cuelgan de `StudentLayout` dentro de `PrivateRoute` con rol
`ALUMNO` (`src/routes/alumno-routes.tsx`). El navbar del alumno ya enlaza
"Laboratorios" → `/alumno/laboratorios`.

## Datos y servicio

- **`src/types/laboratorios.ts`** — `Laboratorio { id, nombre, descripcion, emailContacto: string | null }`. Es toda la información que expone el backend para un laboratorio (no hay logo, ubicación, web, responsable ni contador de proyectos).
- **`src/services/laboratorios.ts`** — `laboratoriosService`:
  - `findAll()` → `GET /laboratorios` (endpoint **público**, sin token).
  - `findOne(id)` → `GET /laboratorios/:id` (público).
  Mismo manejo de errores/timeout que `src/services/projects.ts`, pero sin header `Authorization`.

### Nota importante: filtro de proyectos por NOMBRE de lab

El backend filtra proyectos con `GET /projects?lab=<nombre>` usando el **nombre
exacto** del laboratorio (case-insensitive), **no el id**. Por eso `LabProyectosPage`
y el preview de `LaboratorioDetailPage` primero llaman a `laboratoriosService.findOne(id)`
para obtener `lab.nombre` y recién ahí consultan `projectsService.findAll(token, { lab: lab.nombre, ... })`.

### Preview de proyectos en el hero (`LaboratorioDetailPage`)

Como el laboratorio solo tiene `nombre`/`descripcion`/`emailContacto`, la página de
detalle no tiene más datos propios para mostrar. En vez de repetir la descripción en
una segunda sección, debajo del hero se hace un fetch adicional
(`projectsService.findAll(token, { lab: lab.nombre, limit: 3, offset: 0 })`) y se
muestran hasta 3 proyectos activos reales con `ProjectCardExplore`, el conteo real
(`total` de la respuesta) y un link "Ver todos" a `/alumno/laboratorios/:id/proyectos`.
Si el laboratorio no tiene proyectos activos se muestra un mensaje de vacío; si el
fetch falla, la sección simplemente no se renderiza (no es contenido crítico).

## Componentes nuevos (`src/pages/alumno/components/`)

- **`lab-monogram.tsx`** — `LabMonogram` (iniciales del lab en un cuadrado) + util `getLabInitials(nombre)`. Variantes `muted` (cards) y `onPrimary` (hero).
- **`lab-card.tsx`** — `LabCard`, card grande enlazada al detalle del lab.
- **`lab-projects-filters-bar.tsx`** — `LabProjectsFiltersBar`, variante reducida de `ProjectFiltersBar` (búsqueda + skills, sin selector de laboratorio, porque la vista ya está acotada a un lab).

## Reutilización

- `ProjectCardExplore` — card de proyecto de la grilla de la pantalla 3.
- `useProjectFilters` — sincroniza `q` y `skills` con la query string (+ debounce). El `lab` del hook se ignora porque queda fijo por la ruta.
- `skillsService.findAll(token)` — pobla las opciones del combobox de habilidades.
- `projectsService.findAll` — listado paginado de proyectos.

## Estilo

Sigue `DESIGN.md`: solo tokens CSS (`bg-primary`, `text-primary-foreground`,
`bg-muted`, `text-muted-foreground`, etc.), títulos con `font-display`, sombras
`shadow-card`/`shadow-card-hover`, jerarquía por superficie. El hero usa una
banda `bg-primary` para dar a la sección una identidad distinta al resto de la app
sin salirse del sistema de diseño.
