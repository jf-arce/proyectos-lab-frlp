# 002 — Autenticación: implementación en el frontend

## Contexto

El backend ya implementa JWT con access token de vida corta (15m) y refresh token opaco persistido en DB (7d). El frontend necesita gestionar esa sesión de forma segura, proteger rutas por rol y restaurar la sesión al recargar la página.

---

## Decisiones

### 1. Access token en memoria, refresh token en `localStorage`

El access token se guarda únicamente en estado React (`useState`) — nunca en `localStorage` ni `sessionStorage`.  
El refresh token se guarda en `localStorage` bajo la clave `refreshToken`.

**Por qué:**
- Un access token en `localStorage` es vulnerable a XSS: cualquier script en la página puede leerlo y usarlo directamente.
- Al tenerlo solo en memoria, su tiempo de vida real queda acotado a la sesión del tab. Si el tab se cierra, el access token desaparece.
- El refresh token en `localStorage` permite restaurar la sesión tras un F5. Aunque `localStorage` también es accesible por XSS, el refresh token por sí solo no permite hacer requests autenticados directamente a la API (requiere que el backend lo valide y emita un nuevo access token), lo que reduce el impacto.
- La alternativa más segura sería una `httpOnly cookie` para el refresh token (inaccesible desde JS), pero requiere configuración de CORS con `credentials: 'include'` en el backend y agrega complejidad. Se deja como mejora futura si el contexto lo justifica.

### 2. `AuthContext` como única fuente de verdad de sesión

Se creó un `AuthProvider` en `src/context/auth-context.tsx` que expone:

```ts
{
  user: JwtPayload | null       // payload decodificado del JWT: sub, email, role, laboratoryId
  token: string | null          // access token en memoria
  isLoading: boolean            // true mientras se intenta restaurar la sesión al montar
  login(email, password)        // retorna JwtPayload
  register(dto)                 // retorna JwtPayload (reservado; ver nota)
  logout()                      // invalida el refresh token en backend y limpia estado
}
```

`AuthProvider` vive en `main.tsx`, envolviendo toda la app.

**Por qué `login` retorna `JwtPayload`:**  
React actualiza el estado de forma asíncrona. Si el componente de login lee `user` del contexto inmediatamente después de llamar a `login()`, el valor todavía es `null` porque el re-render aún no ocurrió. Para navegar según el rol sin esperar el ciclo de render, `login()` retorna el payload decodificado directamente.

**Nota sobre `register` en el contexto:**  
El `register-page.tsx` llama a `authService.register()` directamente (sin pasar por `context.register`) porque el registro no inicia sesión automáticamente: redirige al usuario al login con un toast de confirmación. La función `register` del contexto queda disponible para flujos futuros que sí requieran auto-login tras el registro.

### 3. Restauración de sesión al montar

En el `useEffect` inicial de `AuthProvider`:

1. Se lee el `refreshToken` de `localStorage`.
2. Si existe, se llama a `POST /auth/refresh`.
3. Si el backend responde con un nuevo access token, se decodifica y se restaura `user` y `token` en el estado.
4. Si falla (token expirado o inválido), se elimina de `localStorage` y el usuario queda deslogueado.
5. `isLoading` se pone en `false` una vez terminado este proceso (exitoso o no).

### 4. `PrivateRoute` con control de rol

`src/components/private-route.tsx` es un wrapper de `<Outlet />` que aplica esta lógica:

```
No hay token           → <Navigate to="/login" />
Rol no permitido       → <Navigate to="/login" />
OK                     → <Outlet />
```

Mientras `isLoading` es `true` (restaurando sesión), renderiza `null` para evitar un flash de redirección al login antes de que el refresh termine.

Uso en routing:
```tsx
<Route element={<PrivateRoute allowedRoles={['ALUMNO']} />}>
  <Route path="/alumno/labs" element={<LabsPage />} />
</Route>
```

### 5. Estructura de archivos

```
src/
├── services/
│   └── auth.ts              # fetch a /auth/login, /register, /refresh, /logout
├── context/
│   └── auth-context.tsx     # AuthProvider + AuthContext
├── hooks/
│   └── use-auth.ts          # useAuth() — shortcut para consumir el contexto
├── components/
│   ├── private-route.tsx    # guard de rutas con control de rol
│   └── ui/
│       └── form.tsx         # componente Form de shadcn (integración react-hook-form)
└── pages/
    └── auth/
        ├── login-page.tsx   # formulario email + password; toast de éxito con sonner
        └── register-page.tsx # formulario solo para ALUMNO; redirige a /login tras registro
```

### 6. Campos del registro

El formulario de registro es exclusivamente para alumnos. El rol `RESPONSABLE_LABORATORIO` se asigna fuera del flujo de auto-registro (por administración u otro mecanismo aún no definido).

Campos del formulario: `nombre`, `apellido`, `email`, `password`, `legajo`, `anioEnCurso` (select 1–5).  
El campo `rol` se envía siempre como `ALUMNO` y no se expone al usuario.

La validación del formulario usa **react-hook-form** con esquema **zod**:
- `nombre` / `apellido`: mínimo 2 caracteres
- `email`: formato válido
- `password`: mínimo 8 caracteres
- `legajo`: obligatorio
- `anioEnCurso`: selección obligatoria (1 a 5)

Tras el registro exitoso, el usuario es redirigido a `/login` con un toast de confirmación (sonner). No se inicia sesión automáticamente.

---

## Lo que queda fuera de este módulo

- **Renovación automática del access token** (token refresh silencioso antes de que expire): se implementará cuando se agregue un interceptor HTTP centralizado en otro módulo.
- **Logout global en múltiples tabs**: si el usuario cierra sesión en un tab, los otros tabs no se enteran hasta que su access token expire. Aceptable para el alcance actual.
- **httpOnly cookie para el refresh token**: mejora de seguridad posible si el contexto lo requiere.
