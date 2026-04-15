# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
There are in the `package.json` scripts for development and production builds.
No test runner is configured yet.

## Architecture

Folder structure, routing pattern, component placement, and naming conventions are documented in [`docs/architecture.md`](./docs/architecture.md).  
Auth implementation decisions (token storage, `AuthContext`, `PrivateRoute`) are documented in [`docs/decisions/001-auth-frontend.md`](./docs/decisions/001-auth-frontend.md).

### API layer

`src/lib/api.ts` exports `API_URL` (defaults to `http://localhost:3000/api`, overridden by `VITE_API_URL`).

New services follow the same pattern as `src/services/auth.ts`: a plain object with async methods that call a shared `request()` helper (10 s abort timeout, throws on non-2xx).

### Styling

Tailwind CSS 4 via `@tailwindcss/vite` plugin — no separate `tailwind.config.js`. Global styles and CSS variables (design tokens) live in `src/index.css`. Fonts: Manrope (variable) and Inter from `@fontsource`.

### Forms

React Hook Form + Zod + `@hookform/resolvers`. Use the shadcn `<Form>` wrapper (`src/components/ui/form.tsx`) for consistent field/error rendering.

### Roles

```ts
// src/types/auth.ts
export const Role = {
  ALUMNO: 'ALUMNO',
  RESPONSABLE_LABORATORIO: 'RESPONSABLE_LABORATORIO',
} as const;
```

The JWT payload (`JwtPayload`) carries `sub`, `email`, `role`, and optionally `laboratoryId`.

## UI / Componentes

Reglas obligatorias al crear o modificar vistas, secciones o componentes:

### Design system
- Seguir **estrictamente** `DESIGN.md` (en la raíz del repo): tokens de color, tipografía, superficies, espaciado y componentes documentados allí.
- Nunca hardcodear colores hex ni usar `text-black` / `text-white`. Usar siempre tokens CSS (`text-foreground`, `bg-muted`, `text-primary`, etc.).

### Separación estructura / lógica
- Al crear algo nuevo: implementar primero **solo** HTML + Tailwind + componentes shadcn, con datos hardcodeados si hace falta.
- La lógica real (fetching, estado, formularios) se integra en un paso posterior, a menos que el usuario la pida explícitamente en la misma tarea.

### Prioridad de componentes (en orden)
1. **Buscar en `src/components/ui/`** — si ya existe el componente, usarlo tal cual.
2. **Activar la skill `shadcn`** — investigar si existe un componente shadcn que cubra el caso; si existe, instalarlo con `npx shadcn add <component>`.
   - **Nunca sobreescribir** un componente ya instalado. Si el instalador advierte que sobreescribirá uno existente, cancelar y adaptar el componente existente.
3. **Componente custom** — solo si no existe nada en los pasos anteriores. En ese caso, presentar opciones al usuario antes de implementar.