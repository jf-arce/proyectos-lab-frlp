# Runbook: Migraciones de base de datos

## Contexto

En desarrollo, TypeORM sincroniza el schema automáticamente (`synchronize: true`).
En producción, el schema solo se modifica mediante migraciones versionadas (`migrationsRun: true`, `synchronize: false`).

Las migraciones se generan desde el código TypeScript usando `data-source.ts` como punto de entrada de la CLI.

---

## Generar una migración

Luego de modificar o crear una entidad, generar la migración correspondiente:

```bash
npm run migration:generate -- src/migrations/<NombreMigration>
```

**Ejemplo:**

```bash
npm run migration:generate -- src/migrations/AddPhoneToUser
```

Esto crea un archivo `src/migrations/<timestamp>-AddPhoneToUser.ts` con los métodos `up` y `down` generados automáticamente comparando las entidades contra el schema actual de la DB.

> Revisar siempre el archivo generado antes de commitear. TypeORM puede generar cambios inesperados si el schema de la DB no está sincronizado con el estado anterior de las entidades.

---

## Aplicar migraciones (desarrollo)

En desarrollo las migraciones no corren automáticamente. Para aplicarlas manualmente:

```bash
npm run migration:run
```

> En producción (`NODE_ENV=production`), las migraciones corren automáticamente al iniciar la aplicación (`migrationsRun: true`).

---

## Revertir la última migración

```bash
npm run migration:revert
```

Ejecuta el método `down` de la migración más reciente aplicada. Solo revierte una migración por vez.

---

## Primer deploy a producción

Cuando el proyecto esté listo para su primer deploy, el schema no existe en el servidor. Pasos:

1. Asegurarse de que todas las entidades están en su estado final para el deploy.
2. Generar la migración inicial:
   ```bash
   npm run migration:generate -- src/migrations/InitialSchema
   ```
3. Hacer el build:
   ```bash
   npm run build
   ```
4. En el servidor, setear `NODE_ENV=production` y levantar la app — las migraciones corren solas al iniciar.

---

## Solución de problemas comunes

### La migración generada está vacía

El schema de la DB ya coincide con las entidades. No hay cambios pendientes.

### Error al correr migraciones en producción al iniciar la app

Verificar que el build esté actualizado (`npm run build`) antes del deploy. Las migraciones en producción se ejecutan desde `dist/migrations/*.js`.

### Se quiere ignorar una migración generada

Eliminar el archivo. No hacer `migration:run` de una migración que no se quiere aplicar.
