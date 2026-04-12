# Entorno de desarrollo local

## Requisitos

- [Node.js 20+](https://nodejs.org/)
- Git
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — solo si usás PostgreSQL local

---

## Opción A — PostgreSQL local con Docker

### Primeros pasos (primera vez)

```bash
# 1. Instalar todas las dependencias (frontend + backend)
npm install

# 2. Levantar la base de datos
npm run docker:up

# 3. Levantar backend y frontend (cada uno en su terminal)
npm run dev:back
npm run dev:front
```

### Flujo diario

```bash
npm run docker:up   # levanta la DB (si no está corriendo)
npm run dev:back    # terminal 1
npm run dev:front   # terminal 2
```

Para bajar la DB:

```bash
npm run docker:down          # detiene el contenedor (datos persistidos)
npm run docker:down -- -v    # detiene y elimina el volumen (borra la DB)
```

### Variables de entorno (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lab_frlp
```

> El contenedor expone PostgreSQL en el puerto `5433` para evitar conflictos con instalaciones locales de PostgreSQL.

---

## Opción B — PostgreSQL en la nube (Neon, Supabase, etc.)

No requiere Docker. Solo configurar el `backend/.env` con las credenciales del servicio:

```bash
# 1. Instalar todas las dependencias
npm install

# 2. Levantar backend y frontend (cada uno en su terminal)
npm run dev:back
npm run dev:front
```

### Variables de entorno (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
DB_HOST=ep-xxxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base
```

---

## Servicios disponibles

| Servicio   | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:5173 |
| Backend    | http://localhost:3000 |
| PostgreSQL (Docker) | localhost:5433 |

---

## Comandos útiles

```bash
# Instalar una dependencia en un workspace específico
npm install <paquete> -w backend
npm install <paquete> -w frontend

# Conectarse a la base de datos Docker desde la terminal
docker exec proyectos_lab_db psql -U postgres -d lab_frlp

# Ver logs de la DB
docker compose logs -f db
```

---

## Solución de problemas

### El backend no conecta a la DB al iniciar

Verificá que el contenedor esté corriendo:

```bash
docker compose ps
```

Si no está corriendo:

```bash
npm run docker:up
```

### Puerto 5433 en uso

Cambiá el puerto mapeado en `docker-compose.yml` (ej: `"5434:5432"`) y actualizá `DB_PORT` en `backend/.env`.
