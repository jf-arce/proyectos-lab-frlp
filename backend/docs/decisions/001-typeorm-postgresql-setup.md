# TypeORM + PostgreSQL Setup

## Decisión

Usar TypeORM con PostgreSQL como base de datos, configurado mediante `@nestjs/config` con validación de variables de entorno al inicio.

## Configuración elegida

### `synchronize` y migraciones por entorno

- En **desarrollo**: `synchronize: true` — TypeORM sincroniza el schema automáticamente al arrancar, lo que agiliza la iteración inicial.
- En **producción**: `synchronize: false` + `migrationsRun: true` — el schema solo se modifica a través de migraciones versionadas.

Tener ambos activos simultáneamente genera conflictos: las migraciones crean/modifican tablas y luego `synchronize` intenta re-sincronizar el schema encima, causando errores o estado inconsistente.

### Transición de desarrollo a producción

Cuando el proyecto esté listo para el primer deploy:
1. Generar una migración inicial que capture el estado actual del schema: `npm run migration:generate -- src/migrations/InitialSchema`
2. Hacer el build: `npm run build`
3. Setear `NODE_ENV=production` en el servidor — automáticamente desactiva `synchronize` y activa `migrationsRun`.

### `ConfigModule` con validación Joi

Se validan las variables de entorno al arrancar la aplicación. Si falta alguna variable requerida (`DB_HOST`, `DB_USERNAME`, etc.), la app falla inmediatamente con un mensaje claro en lugar de fallar en runtime de forma difícil de diagnosticar.

### Configuración namespaced (`database.*`)

Las variables de DB se agrupan bajo el namespace `database` mediante `registerAs`. Esto permite accederlas con `config.get('database.host')` en lugar de `config.get('DB_HOST')`, desacoplando el código de los nombres exactos de las variables de entorno.

### `autoLoadEntities: true`

Evita tener que listar manualmente cada entidad en la configuración de TypeORM. Cualquier entidad registrada en un módulo con `TypeOrmModule.forFeature([...])` se carga automáticamente.

### `data-source.ts` separado

La CLI de TypeORM es un proceso independiente que no puede iniciar el `AppModule` de NestJS. El archivo `data-source.ts` le provee la configuración necesaria para generar y correr migraciones desde la terminal.

## Dependencias

| Paquete | Rol |
|---------|-----|
| `@nestjs/typeorm` | Wrapper oficial de NestJS para TypeORM |
| `typeorm` | ORM |
| `pg` | Driver de PostgreSQL requerido por TypeORM |
| `@nestjs/config` | Módulo oficial de NestJS para configuración por entorno |
| `joi` | Validación del schema de variables de entorno |