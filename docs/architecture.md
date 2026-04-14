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
│       ├── context/            # Providers globales (AuthContext)
│       ├── hooks/              # Custom hooks (useAuth, etc.)
│       ├── layouts/            # Layouts con navbar por rol
│       ├── lib/                # Utilidades (cn helper, etc.)
│       ├── pages/              # Páginas agrupadas por rol: auth/, alumno/, responsable/
│       ├── services/           # Llamadas a la API REST, una por dominio
│       ├── types/              # Tipos TypeScript compartidos
│       └── main.tsx            # Entry point: rutas y providers
├── docs/
│   ├── architecture.md
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   └── runbook/                # Operational guides
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