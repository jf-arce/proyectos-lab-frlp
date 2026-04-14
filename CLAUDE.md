# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Portal web para que alumnos de la facultad exploren proyectos de laboratorio y se postulen online, reemplazando el proceso informal por email/presencial. Los responsables de laboratorio publican y gestionan proyectos y postulaciones. Incluye autenticación JWT con roles (ALUMNO / RESPONSABLE), motor de sugerencias por matching de habilidades, y notificaciones in-app y por email.

Módulos principales: Auth & Roles · Perfil del Alumno · Gestión de Proyectos · Exploración & Postulación · Notificaciones · Matching Alumno-Proyecto.

Ver descripción completa, objetivos y alcance en `docs/project-description.md`.

## Rules

- No vuelvas a leer archivos ya leídos en esta sesión a menos que te lo pida. Minimiza las llamadas a herramientas y trabaja con lo que ya tienes en contexto.
- Si necesitas información adicional, haz preguntas específicas para que te la proporcione.
- No asumas nada que no esté explícitamente documentado. Si algo no está claro, haz preguntas para aclararlo.
- Siempre que termines de realizar algo con exito actualiza la documentación correspondiente para que el equipo humano tenga la información más actualizada.
- Si encuentras errores o inconsistencias en la documentación, notifícalo para que se puedan corregir.

## Development Setup

This is an npm workspaces monorepo. Run all root-level commands from the repo root.

## Architecture

See `docs/architecture.md` for stack details and repository structure.

### Backend patterns

- **NestJS modules** — each feature lives under `src/modules/<name>/` with its own module, controller, service, entities, and DTOs.
- **Config** — environment variables are validated at startup via Joi (`src/config/validation.schema.ts`) and accessed through `ConfigService` using the `database.*` namespace.
- **Path alias** — `@/` maps to `src/`. Use `@/modules/...` for cross-module imports; use relative paths within the same module. The `tsc-alias` step in `npm run build` resolves these aliases in `dist/`.
- **TypeORM** — entities use `autoLoadEntities: true`; the `AppDataSource` in `data-source.ts` is only for the migration CLI and reads directly from `process.env`.
- **Synchronize vs. migrations** — `synchronize: true` in development, `migrationsRun: true` (from `dist/migrations/*.js`) in production.

### Frontend patterns

- **shadcn/ui** — component library built on Radix UI primitives. Add components with `npx shadcn add <component>` from `frontend/`.
- **Tailwind CSS 4** — configured via the `@tailwindcss/vite` plugin (no separate `tailwind.config.js`).
- **Path alias** — `@/` maps to `frontend/src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **Routing** — React Router 7.

### Infrastructure decisions

- Only PostgreSQL runs in Docker locally (port 5433 to avoid conflicts with local installs). Backend and frontend run natively for faster hot-reload.
- Alternatively, a cloud DB (Neon, Supabase) can be used by pointing `backend/.env` at the remote host — no Docker needed in that case.
- Production deployment (planned): multi-stage Docker builds + `docker-compose.prod.yml` on a university server.
