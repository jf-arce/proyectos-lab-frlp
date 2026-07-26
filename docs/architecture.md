# Architecture

## Overview

Full-stack monorepo for a web application with a REST API backend and React frontend, orchestrated via npm workspaces.

## Repository Structure

```
proyectos-lab-frlp/
├── backend/          # NestJS REST API
│   └── src/
│       ├── app.module.ts       # Root module — wires ConfigModule + TypeORM + feature modules
│       ├── data-source.ts      # Standalone DataSource for TypeORM CLI (migrations)
│       ├── config/
│       │   ├── database.config.ts    # Registered config namespace "database"
│       │   └── validation.schema.ts  # Joi env validation
│       └── modules/
│           └── <feature>/      # module, controller, service, entities, DTOs
├── frontend/         # React 19 + Vite SPA
│   └── src/
│       ├── components/         # Componentes compartidos (shadcn/ui en ui/, guards en raíz)
│       ├── context/            # Providers globales (auth-context, perfil-context, notifications-context)
│       ├── hooks/               # Custom hooks (use-auth, use-notifications, etc.)
│       ├── layouts/            # Layouts con navbar por rol: student-layout.tsx, lab-layout.tsx
│       ├── lib/                # Utilidades (cn helper, etc.)
│       ├── pages/              # Páginas agrupadas por rol: auth/, alumno/, responsable/
│       ├── routes/             # Route config objects separados por rol (Data mode)
│       ├── services/           # Llamadas a la API REST, una por dominio
│       ├── types/              # Tipos TypeScript compartidos
│       └── main.tsx            # Entry point: createBrowserRouter + RouterProvider
├── docs/
│   ├── architecture.md
│   ├── project-description.md
│   ├── modelo-de-datos.md
│   ├── laboratorios-alumno.md   # flujo de exploración por laboratorio (vista alumno)
│   ├── modules/                 # Especificación funcional de cada módulo del dominio
│   ├── decisions/               # Architecture Decision Records (ADRs)
│   └── runbook/                 # Operational guides
├── docker-compose.yml          # PostgreSQL only
└── package.json                # npm workspace root
```

## Stack

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** TypeORM 0.3
- **Database:** PostgreSQL 16
- **Config:** `@nestjs/config` + Joi validation schema
- **Path aliases:** `tsc-alias` (`@/` → `src/`)

### Frontend
- **Framework:** React 19
- **Bundler:** Vite
- **Language:** TypeScript
- **Routing:** React Router 7
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Font:** Geist Variable

### Infrastructure
- **Local DB:** Docker (PostgreSQL 16 on port 5433)
- **Container name:** `proyectos_lab_db`
- **Database name:** `lab_frlp`

> Ver [ADR-001](decisions/001-infraestructura-local-y-produccion.md) para la justificacion de estas decisiones.

## Frontend — convenciones y estructura

### Naming

Todos los archivos en `frontend/src/` usan **kebab-case** (minúsculas y guiones), igual que shadcn/ui. El nombre del componente o función exportada sigue siendo **PascalCase**.

```
project-card.tsx      → export function ProjectCard()
auth-context.tsx      → export const AuthContext
use-auth.ts           → export function useAuth()
```

### Ubicación de componentes

| Componente                          | Dónde va                            |
|-------------------------------------|-------------------------------------|
| Primitivo shadcn                    | `components/ui/`                    |
| Compartido por toda la app          | `components/`                       |
| Exclusivo de páginas de alumno      | `pages/alumno/components/`          |
| Exclusivo de páginas de responsable | `pages/responsable/components/`     |

Si un componente de rol pasa a usarse en otro rol, se mueve a `components/`.

### Routing

Se usa **React Router 7 en Data mode** (`createBrowserRouter` + `RouterProvider`). Las rutas están separadas por rol en `src/routes/` (`public-routes.tsx`, `alumno-routes.tsx`, `responsable-routes.tsx`) y cada archivo exporta un array de route config objects. `PrivateRoute` actúa como layout route: redirige a `/login` si el usuario no está autenticado o no tiene el rol requerido, y renderiza `<Outlet />` si la sesión es válida.

### Auth flow

- El JWT (access token, vida 15m) se guarda en **memoria** (estado React) para evitar XSS.
- El refresh token (vida 7d) se guarda en `localStorage` bajo la clave `refreshToken`.
- `AuthContext` (`src/context/auth-context.tsx`) expone `user`, `token`, `isLoading`, `login()`, `register()`, `logout()`.
- Al montar la app se intenta restaurar la sesión llamando a `POST /auth/refresh` con el refresh token almacenado. Un timer interno renueva el access token automáticamente 1 minuto antes de que expire, sin interrumpir al usuario. Si el refresh falla, se limpia la sesión y se redirige a `/login`.
- Ver [ADR-004](decisions/004-auth-frontend.md) para el detalle completo.

### Services

Cada archivo en `src/services/` agrupa las llamadas fetch a un dominio de la API y no contiene estado (el estado vive en los componentes o en los contexts):

- `auth.ts` — login, register, refresh, logout.
- `projects.ts` — findAll, findById, applyToProject, withdrawApplication, getMyApplications, getMyApplicationById, getRecommended (Módulo 6).
- `proyectos.ts` — operaciones del responsable sobre sus propios proyectos (create, update, status, applications).
- `alumno.ts` — perfil del alumno (get/update, skills).
- `laboratorios.ts` — listado/detalle de laboratorios (público).
- `skills.ts` — catálogo de habilidades.
- `notifications.ts` — notificaciones in-app (Módulo 5).

## Módulos del dominio

Ver `docs/modules/` para las especificaciones funcionales de cada módulo:

- `01-auth-roles.md`
- `02-perfil-alumno.md`
- `03-gestion-proyectos.md`
- `04-exploracion-postulacion.md`
- `05-notificaciones.md`
- `06-matching.md`