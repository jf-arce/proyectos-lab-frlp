# Módulo 1: Autenticación y Roles

## Descripción

Es el módulo base de la plataforma. Gestiona el registro, el inicio de sesión y el control de acceso. Todo el sistema depende de él: ningún otro módulo puede operar de forma segura sin que la identidad del usuario esté verificada y su rol conocido.

Los dos roles del sistema son:

- **ALUMNO** — puede explorar proyectos, postularse y gestionar su perfil.
- **RESPONSABLE_LABORATORIO** — está asociado a un laboratorio específico y puede gestionar los proyectos y postulaciones de ese laboratorio únicamente.

## Funcionalidades a implementar

### Registro

- Endpoint `POST /auth/register` que acepta `email`, `password` y `role`.
- Validar formato del email y longitud/complejidad mínima de la contraseña.
- Hashear la contraseña con **bcrypt** antes de persistir (nunca guardar texto plano).
- Si el rol es `RESPONSABLE_LABORATORIO`, requerir también el `laboratoryId` al que se asocia.
- Retornar el token JWT directamente tras el registro (o requerir login posterior — definir criterio).

### Login

- Endpoint `POST /auth/login` que acepta `email` y `password`.
- Verificar que el usuario existe y que el hash coincide.
- Emitir un **access token JWT** firmado que incluya en el payload: `sub` (userId), `email`, `role` y, si aplica, `laboratoryId`. Vida corta (`15m`).
- Emitir también un **refresh token** opaco (random de 32 bytes), hasheado con bcrypt y persistido en DB con fecha de expiración (`7d`). Se usa para renovar el access token sin requerir login.
- Endpoint `POST /auth/refresh` que recibe el refresh token, lo valida contra DB y emite un nuevo access token.
- Endpoint `POST /auth/logout` que invalida el refresh token en DB.

### Protección de rutas (Guards)

- **`JwtAuthGuard`** — valida que el token sea válido y no esté expirado. Se aplica globalmente o por controlador.
- **`RolesGuard`** — verifica que el rol del usuario coincide con el decorador `@Roles(...)` del endpoint.
- Decorador personalizado `@Roles('ALUMNO' | 'RESPONSABLE_LABORATORIO')` para marcar qué rol requiere cada endpoint.
- En el frontend, rutas privadas con un componente `<PrivateRoute>` que redirige al login si no hay token válido.

### Manejo de sesión en frontend

- Guardar el JWT en memoria (variable de estado React) para evitar XSS. El refresh token puede guardarse en `localStorage` o, preferentemente, en una `httpOnly cookie` para mayor seguridad.
- Crear un contexto global `AuthContext` que exponga `user`, `token`, `login()`, `logout()`.
- Al recargar la página, leer el token almacenado, verificar expiración (decodificando el payload con `jwt-decode`) y restaurar el estado de sesión.
- `logout()` borra el token y redirige al login.

## Estructura de código sugerida

### Backend — `src/modules/auth/`

```
auth/
├── auth.module.ts
├── auth.controller.ts       # POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
├── auth.service.ts          # lógica de registro, login, refresh y logout
├── jwt.strategy.ts          # Passport JWT strategy
├── jwt-auth.guard.ts        # guard global de autenticación
├── roles.guard.ts           # guard de autorización por rol
├── roles.decorator.ts       # @Roles(...)
├── entities/
│   └── refresh-token.entity.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts
```

### Frontend — `src/`

```
context/
└── AuthContext.tsx           # proveedor global de autenticación

components/
└── PrivateRoute.tsx          # redirige si no autenticado o sin el rol requerido

pages/
├── LoginPage.tsx
└── RegisterPage.tsx
```

## Dependencias y paquetes

### Backend

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

### Frontend

```bash
npm install jwt-decode
```

## Variables de entorno requeridas (backend)

```env
JWT_SECRET=supersecret
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION_DAYS=7
```

## Consideraciones de seguridad

- Nunca exponer el `JWT_SECRET` en el código fuente; siempre desde variables de entorno.
- Usar bcrypt con un salt rounds de al menos 10.
- Los endpoints de registro y login son los únicos que deben ser públicos; todos los demás requieren `JwtAuthGuard`.
- El `laboratoryId` del responsable debe venir del token, nunca del body de la request, para evitar escalada de privilegios.
