# 001 — Infraestructura: entorno local y estrategia de producción

## Contexto

El proyecto es un monorepo con un backend NestJS + TypeORM y un frontend React + Vite. Se trabaja en equipo de 2 personas y el deploy de producción está previsto en un servidor de la facultad con soporte para Docker.

## Decisiones tomadas para desarrollo local

### Base de datos con Docker, backend y frontend nativos

Se optó por levantar únicamente PostgreSQL en un contenedor Docker, mientras que el backend y el frontend se corren de forma nativa con sus respectivos comandos de desarrollo (`npm run dev:back`, `npm run dev:front`).

**Por qué:**
- Cada desarrollador tiene su propia base de datos aislada — los cambios de esquema o datos de prueba no afectan al otro.
- El hot-reload nativo de NestJS y Vite es más rápido y sin fricción que dentro de un contenedor.
- Evita la necesidad de reconstruir imágenes Docker al agregar dependencias.
- Docker solo se usa para lo que realmente aporta valor en esta etapa: aislar el servicio de base de datos del sistema operativo del desarrollador.

**Por qué no dockerizar todo en dev:**
- Dockerizar backend y frontend en desarrollo agrega fricción (rebuild al cambiar dependencias, configuración de volúmenes, polling para hot-reload) sin un beneficio real cuando el equipo es pequeño.
- Los Dockerfiles de desarrollo quedan obsoletos rápido y no son los que se usan en producción de todas formas.

### Puerto 5433 para PostgreSQL

El contenedor expone PostgreSQL en el puerto `5433` en lugar del estándar `5432`.

**Por qué:** Evita conflictos con instalaciones locales de PostgreSQL que los desarrolladores puedan tener en sus máquinas. Es una práctica común en equipos donde no se puede garantizar el estado del entorno de cada desarrollador.

### Monorepo con npm workspaces

Se configuró un `package.json` raíz con npm workspaces apuntando a `frontend/` y `backend/`.

**Por qué:**
- `npm install` desde la raíz instala las dependencias de ambos proyectos en un solo comando.
- Scripts globales (`dev:back`, `dev:front`, `docker:up`, `docker:down`) centralizan los comandos más usados.

### Base de datos: Docker local vs. servicio en la nube

Cada desarrollador puede optar por usar el contenedor Docker local **o** un servicio en la nube como Neon o Supabase, simplemente configurando el `backend/.env`. Ambas opciones están documentadas en el runbook.

---

## Estrategia para producción

Cuando el proyecto esté listo para desplegarse en el servidor de la facultad, los pasos serán:

### 1. Dockerfiles de producción (multi-stage build)

Se crearán Dockerfiles optimizados para producción, distintos a los de desarrollo:

- **Backend:** compilar TypeScript a JavaScript (`npm run build`) y correr solo el `dist/` con Node en una imagen liviana.
- **Frontend:** compilar el bundle con Vite (`npm run build`) y servirlo con Nginx.

No se crean ahora porque la configuración exacta depende del entorno del servidor y va a cambiar a medida que avance el proyecto.

### 2. `docker-compose.prod.yml`

Se creará un archivo de compose separado que orqueste los 3 servicios (DB + backend + frontend) para producción. El flujo de deploy en el servidor sería:

```bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Base de datos en producción

Se evaluará entre:
- **PostgreSQL en el mismo servidor** (contenedor Docker) — simple, sin costo, datos en el propio servidor.
- **Servicio en la nube** (Neon, Supabase) — más robusto, backups automáticos, sin gestión de infraestructura.

### 4. Variables de entorno de producción

Se inyectarán directamente en el servidor (no se commitea ningún `.env` de producción al repositorio).
