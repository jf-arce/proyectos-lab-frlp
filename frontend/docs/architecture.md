# Frontend Architecture

## Naming convention

Todos los archivos en `src/` usan **kebab-case** (minúsculas y guiones), igual que shadcn/ui.  
El nombre del componente o función exportada sigue siendo **PascalCase**.

```
project-card.tsx      → export function ProjectCard()
auth-context.tsx      → export const AuthContext
use-auth.ts           → export function useAuth()
```

## Folder structure

```
src/
├── context/
│   └── auth-context.tsx         # Estado global: user, token, login(), logout()
│
├── hooks/
│   └── use-auth.ts              # Shortcut para consumir AuthContext
│
├── components/
│   ├── ui/                      # Primitivos shadcn (no modificar directamente)
│   └── private-route.tsx        # Redirige si no autenticado o sin el rol requerido
│
├── layouts/
│   ├── navbar.tsx
│   ├── alumno-layout.tsx        # Layout con navbar para páginas de alumno
│   └── responsable-layout.tsx   # Layout con navbar para páginas de responsable
│
├── routes/
│   ├── public-routes.tsx        # Rutas públicas: /, /login, /register
│   ├── alumno-routes.tsx        # Rutas privadas del alumno (con PrivateRoute)
│   └── responsable-routes.tsx   # Rutas privadas del responsable (con PrivateRoute)
│
├── pages/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   └── register-page.tsx
│   │
│   ├── alumno/
│   │   ├── components/              # Componentes exclusivos de páginas de alumno
│   │   ├── dashboard-page.tsx       # /alumno/dashboard
│   │   ├── labs-page.tsx            # /alumno/laboratorios
│   │   ├── lab-detail-page.tsx      # /alumno/laboratorios/:id
│   │   ├── project-detail-page.tsx  # /alumno/proyecto/:id
│   │   └── postulaciones-page.tsx   # /alumno/postulaciones
│   │
│   └── responsable/
│       ├── components/                      # Componentes exclusivos de páginas de responsable
│       ├── dashboard-page.tsx               # /responsable/dashboard
│       ├── laboratorio-page.tsx             # /responsable/laboratorio
│       └── project-postulaciones-page.tsx   # /responsable/proyectos/:id/postulaciones
│
├── services/                    # Llamadas a la API REST, una por dominio
│   ├── auth.ts                  # login, register, refresh, logout
│   ├── projects.ts              # findAll, findById, applyToProject, getMyApplications
│   ├── proyectos.ts             # operaciones del responsable (create, update, status)
│   ├── skills.ts
│   ├── profile.ts               # (pendiente)
│   ├── notifications.ts         # (pendiente)
│   └── matching.ts              # (pendiente — recomendaciones ya en projects.ts)
│
└── types/                       # Tipos TypeScript compartidos
    ├── auth.ts
    ├── project.ts
    ├── application.ts
    └── notification.ts
```

## Routing

Se usa **React Router 7 en Data mode** (`createBrowserRouter` + `RouterProvider`).
Las rutas están separadas por rol en `src/routes/` y cada archivo exporta un array de route config objects.

`PrivateRoute` actúa como layout route: redirige a `/login` si el usuario no está autenticado
o no tiene el rol requerido, y renderiza `<Outlet />` si la sesión es válida.

```tsx
// main.tsx
const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Outlet />
      </AuthProvider>
    ),
    children: [...publicRoutes, ...alumnoRoutes, ...responsableRoutes],
  },
]);
```

Cada archivo en `routes/` exporta un array:

```ts
// alumno-routes.tsx
export const alumnoRoutes = [
  {
    element: <PrivateRoute allowedRoles={[Role.ALUMNO]} />,
    children: [
      { path: '/alumno/dashboard', element: <AlumnoDashboardPage /> },
      { path: '/alumno/laboratorios', element: <LaboratoriosPage /> },
      { path: '/alumno/laboratorios/:id', element: <LaboratorioDetailPage /> },
      { path: '/alumno/proyecto/:id', element: <ProjectDetailPage /> },
      { path: '/alumno/postulaciones', element: <PostulacionesPage /> },
    ],
  },
];
```

Al agregar nuevas páginas de un rol, solo se edita el archivo de ese rol en `routes/`.

## Auth flow

- El JWT (access token, vida 15m) se guarda en **memoria** (estado React) para evitar XSS.
- El refresh token se guarda en `localStorage` o `httpOnly cookie`.
- `AuthContext` expone `user`, `token`, `login()`, `logout()`.
- Al recargar la página se decodifica el token con `jwt-decode`, se verifica expiración
  y se restaura la sesión.

## Components placement

| Componente                          | Dónde va                            |
|-------------------------------------|-------------------------------------|
| Primitivo shadcn                    | `components/ui/`                    |
| Compartido por toda la app          | `components/`                       |
| Exclusivo de páginas de alumno      | `pages/alumno/components/`          |
| Exclusivo de páginas de responsable | `pages/responsable/components/`     |

Si un componente de rol pasa a usarse en otro rol, se mueve a `components/`.

## Services

Cada archivo en `services/` agrupa las llamadas fetch a un dominio de la API.
No contienen estado; el estado vive en los componentes o en `AuthContext`.

## Módulos del dominio

Ver `docs/modules/` para las especificaciones funcionales de cada módulo:

- `01-auth-roles.md`
- `02-perfil-alumno.md`
- `03-gestion-proyectos.md`
- `04-exploracion-postulacion.md`
- `05-notificaciones.md`
- `06-matching.md`
