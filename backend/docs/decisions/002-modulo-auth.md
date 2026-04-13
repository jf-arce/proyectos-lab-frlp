# 002 — Módulo de autenticación y autorización

## Contexto

El módulo de auth es la base de toda la plataforma. Gestiona el registro, el login, la renovación de sesión y el cierre de sesión. Sin él, ningún otro módulo puede operar de forma segura. Se implementó como la primera pieza del backend, antes que perfiles, proyectos o postulaciones.

El sistema tiene dos roles: `ALUMNO` y `RESPONSABLE_LABORATORIO`. La identidad del usuario y su rol deben estar disponibles en cada request a través de un token verificable.

---

## Decisiones y justificaciones

### 1. JWT de vida corta (15m) + refresh token opaco (7d)

Se emiten dos tokens en el login:

- **Access token JWT** firmado con `JWT_SECRET`, vida de 15 minutos. Se incluye en el header `Authorization: Bearer <token>` de cada request protegido.
- **Refresh token opaco**: 32 bytes aleatorios generados con `crypto.randomBytes`. Se envía al cliente una sola vez en texto plano. En la base de datos se persiste únicamente su hash bcrypt.

**Por qué vida corta para el access token:**
Si un access token es robado, el atacante tiene una ventana de 15 minutos antes de que expire. No hay forma de invalidarlo antes porque los JWT son stateless. Reducir su vida es la única mitigación sin agregar infraestructura (lista negra, Redis, etc.).

**Por qué refresh token opaco y no otro JWT:**
Un segundo JWT como refresh token requeriría rotar el secreto para invalidarlo. Un token opaco se puede invalidar eliminando su registro en la base de datos, lo que permite cerrar sesiones individuales (logout) o todas las sesiones de un usuario a la vez. Es la base de cualquier sistema de sesión revocable.

**Por qué hashear el refresh token en DB:**
Si la base de datos es comprometida, los refresh tokens en texto plano permitirían al atacante suplantar sesiones indefinidamente. Guardando solo el hash bcrypt, el atacante obtiene hashes que no puede revertir. El token en claro se entrega al cliente una sola vez y nunca más se almacena sin hashear.

---

### 2. El registro retorna solo access token, el login retorna ambos

En el registro (`POST /auth/register`) se emite únicamente el access token. En el login (`POST /auth/login`) se emiten access token y refresh token.

**Por qué:**
El refresh token implica una sesión persistida en base de datos. En el registro, el usuario acaba de crear su cuenta y típicamente navegará directamente a la aplicación; un access token de 15 minutos es suficiente para esa primera interacción. Agregar un refresh token en el registro es una sesión adicional en DB que el usuario podría nunca usar (si cierra el tab inmediatamente). El patrón login → refresh token es el flujo normal de sesión persistente.

---

### 3. `laboratorio_id` como columna temporal en `usuario`

El modelo de datos define una entidad `RESPONSABLE_LABORATORIO` separada con la FK `laboratorio_id`. Sin embargo, ese módulo de perfiles no está implementado aún. Para que el JWT pueda incluir el `laboratorioId` en el payload desde el primer login, se agregó una columna nullable `laboratorio_id` directamente en la tabla `usuario`.

**Por qué no esperar al módulo de perfiles:**
El `laboratorioId` en el JWT es un requisito de seguridad: los endpoints del responsable deben obtener el laboratorio desde el token, nunca del body del request, para evitar escalada de privilegios. Sin este campo en el JWT, los endpoints futuros no podrían validar que el responsable solo gestiona su propio laboratorio.

**Costo de la decisión:**
Cuando se implemente el módulo de perfiles (`RESPONSABLE_LABORATORIO`), se migrará este campo a la tabla correspondiente y el JWT strategy cargará el `laboratorioId` desde la relación en DB en lugar de leerlo del payload.

---

### 4. `JwtAuthGuard` por controlador, no global

Los guards `JwtAuthGuard` y `RolesGuard` se exportan desde `AuthModule` pero no se registran como `APP_GUARD` global. Cada controlador protegido los aplica explícitamente con `@UseGuards(JwtAuthGuard, RolesGuard)`.

**Por qué:**
Con solo un módulo (auth) y un controlador de usuarios vacío en esta etapa, registrar un guard global requeriría también un decorador `@Public()` para marcar los cuatro endpoints públicos de auth. Eso es más código para el mismo resultado. El patrón global escala mejor cuando hay 10+ controladores y la mayoría están protegidos; ese es el momento correcto de migrarlo.

**Cómo usar en módulos futuros:**

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @Get()
  findAll() { ... }
}
```

Los guards y el `JwtModule` se exportan desde `AuthModule` para que otros módulos puedan importarlos sin reimportar Passport.

---

### 5. `UsersService` como única interfaz de acceso a `usuario`

`AuthService` no inyecta `Repository<User>` directamente. Toda operación sobre la tabla `usuario` pasa por `UsersService` (`findByEmail`, `findById`, `create`, `emailExists`).

**Por qué:**
Mantiene la capa de persistencia de usuario centralizada. Cuando el módulo de perfiles necesite hacer operaciones sobre `usuario`, usará el mismo servicio y no duplicará lógica de acceso a la entidad. `AuthModule` importa `UsersModule` y usa su servicio; no exporta el repositorio.

---

### 6. Named imports para `bcrypt` y `crypto`

Se usan `import { compare, hash } from 'bcrypt'` e `import { randomBytes } from 'crypto'` en lugar de namespace imports (`import * as bcrypt from 'bcrypt'`).

**Por qué:**
Con `"moduleResolution": "nodenext"` en `tsconfig.json`, los namespace imports de módulos CJS pueden hacer que el TypeScript language server pierda la información de tipos y los marque como `error typed`, activando la regla `@typescript-eslint/no-unsafe-assignment`. Los named imports resuelven el tipo correctamente en todos los contextos (CLI, IDE, language server).

---

### 7. Definite assignment assertions (`!`) en entidades TypeORM

Todas las propiedades de entidades TypeORM usan `!`:

```ts
@Column()
email!: string;
```

**Por qué:**
TypeORM asigna los valores de las columnas en runtime mediante reflection, no en el constructor de la clase. TypeScript (con `strictPropertyInitialization`, que se activa con `strict: true` o puede ser detectado por el language server del IDE) no puede saber esto y marca las propiedades como "no definitivamente asignadas". El `!` le indica al compilador que el desarrollador garantiza la asignación en runtime.

---

### 8. `configService.getOrThrow()` en lugar de `configService.get()!`

En `JwtStrategy`, el secreto JWT se obtiene con:

```ts
secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
```

**Por qué:**
`getOrThrow()` retorna `string` (no `string | undefined`) y lanza una excepción clara si la variable de entorno no existe. Elimina la necesidad del operador `!` (non-null assertion) que silencia el error en tiempo de compilación pero explota en runtime con un mensaje críptico. La validación Joi en el arranque también protege esto, pero `getOrThrow()` es una segunda línea de defensa más explícita.

---

## Limitaciones conocidas (a resolver en iteraciones futuras)

| Limitación | Impacto | Solución futura |
|---|---|---|
| Lookup de refresh token por iteración con bcrypt | O(n) en cantidad de sesiones activas | Agregar columna `selector` (primeros 8 bytes en texto plano) para hacer `WHERE selector = $1` antes del bcrypt compare |
| `laboratorio_id` en tabla `usuario` | Duplica lógica con la entidad `RESPONSABLE_LABORATORIO` | Migrar al módulo de perfiles cuando se implemente; cargar desde relación en DB en `JwtStrategy.validate()` |
| Refresh token no se rota en `/auth/refresh` | El token anterior sigue siendo válido tras un refresh | Implementar token rotation: eliminar el token viejo y emitir uno nuevo en la misma operación |
| Sin rate limiting en endpoints de auth | Vulnerable a fuerza bruta en `/auth/login` | Agregar `@nestjs/throttler` con límite de intentos por IP |
