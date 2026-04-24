# 001 — Autenticación: implementación en el frontend

## Decisiones

### 1. Almacenamiento de tokens

- **Access token** → estado React (`useState`). Nunca persiste; desaparece al cerrar el tab.
- **Refresh token** → `localStorage` bajo la clave `refreshToken`. Permite restaurar la sesión tras F5.

### 2. `AuthContext`

`src/context/auth-context.tsx` expone:

```ts
{
  user: JwtPayload | null   // sub, email, role, nombre, apellido, laboratoryId
  token: string | null      // access token en memoria
  isLoading: boolean        // true mientras se restaura la sesión al montar
  login(email, password)    // retorna JwtPayload (para navegar por rol sin esperar re-render)
  register(dto)             // retorna JwtPayload
  logout()                  // invalida refresh token en backend y limpia estado
}
```

### 3. Restauración de sesión al montar

Al montar `AuthProvider` se lee el refresh token de `localStorage` y se llama a `POST /auth/refresh`. Si tiene éxito se restaura `user` y `token`; si falla se elimina el token y el usuario queda deslogueado. `isLoading` pasa a `false` al terminar.

### 4. Renovación automática del access token

Cada vez que `AuthProvider` recibe un access token (login, registro, restauración) programa un `setTimeout` para disparar **1 minuto antes de su expiración**. Cuando dispara llama a `POST /auth/refresh` en background:

- **Éxito** → actualiza `token`/`user` y programa el próximo timer.
- **Fallo** → limpia la sesión y redirige a `/login`.

El usuario nunca percibe la renovación mientras el refresh token sea válido (7 días).

### 5. `PrivateRoute`

`src/components/private-route.tsx` protege rutas por rol:

```
isLoading        → null (evita flash de redirección)
sin token        → /login
rol no permitido → /login
OK               → <Outlet />
```

### 6. Registro

Solo para alumnos. El rol `RESPONSABLE_LABORATORIO` se asigna por administración. Tras el registro exitoso redirige a `/login` con un toast; no inicia sesión automáticamente.

---

## Pendientes / mejoras futuras

- **httpOnly cookie** para el refresh token (mayor seguridad contra XSS).
- **Logout global entre tabs** (actualmente cada tab se entera al expirar su propio access token).
