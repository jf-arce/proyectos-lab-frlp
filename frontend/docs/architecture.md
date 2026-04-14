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
├── pages/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   └── register-page.tsx
│   │
│   ├── alumno/
│   │   ├── components/          # Componentes exclusivos de páginas de alumno
│   │   ├── labs-page.tsx
│   │   ├── lab-detail-page.tsx
│   │   ├── lab-projects-page.tsx
│   │   ├── my-applications-page.tsx
│   │   ├── profile-page.tsx
│   │   ├── recommended-page.tsx
│   │   └── notifications-page.tsx
│   │
│   └── responsable/
│       ├── components/          # Componentes exclusivos de páginas de responsable
│       ├── manage-projects-page.tsx
│       ├── applications-received-page.tsx
│       └── notifications-page.tsx
│
├── services/                    # Llamadas a la API REST, una por dominio
│   ├── auth.ts
│   ├── projects.ts
│   ├── profile.ts
│   ├── applications.ts
│   ├── notifications.ts
│   └── matching.ts
│
└── types/                       # Tipos TypeScript compartidos
    ├── auth.ts
    ├── project.ts
    ├── application.ts
    └── notification.ts
```

## Routing

Las rutas están separadas por rol. `PrivateRoute` recibe una prop `role` y redirige
si el usuario no está autenticado o no tiene el rol requerido.

```tsx
<Routes>
  {/* Públicas */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Alumno */}
  <Route element={<PrivateRoute role="ALUMNO" />}>
    <Route element={<AlumnoLayout />}>
      <Route path="/alumno/labs" element={<LabsPage />} />
      <Route path="/alumno/lab/:labId" element={<LabDetailPage />} />
      <Route path="/alumno/lab/:labId/projects" element={<LabProjectsPage />} />
      <Route path="/alumno/my-applications" element={<MyApplicationsPage />} />
      <Route path="/alumno/profile" element={<ProfilePage />} />
      <Route path="/alumno/recommended" element={<RecommendedPage />} />
      <Route path="/alumno/notifications" element={<NotificationsPage />} />
    </Route>
  </Route>

  {/* Responsable */}
  <Route element={<PrivateRoute role="RESPONSABLE_LABORATORIO" />}>
    <Route element={<ResponsableLayout />}>
      <Route path="/responsable/manage-projects" element={<ManageProjectsPage />} />
      <Route path="/responsable/applications" element={<ApplicationsReceivedPage />} />
      <Route path="/responsable/notifications" element={<NotificationsPage />} />
    </Route>
  </Route>
</Routes>
```

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
