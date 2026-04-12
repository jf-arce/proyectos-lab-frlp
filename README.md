# Portal de Proyectos de Laboratorio — FRLP

Plataforma web para que alumnos de la facultad exploren proyectos de laboratorio y se postulen online, reemplazando el proceso informal por email/presencial. Los responsables de laboratorio publican y gestionan proyectos y postulaciones.

## Modulos

| Modulo | Descripcion |
|--------|-------------|
| Auth & Roles | Registro, login con JWT, roles ALUMNO / RESPONSABLE |
| Perfil del Alumno | Datos personales, habilidades (tags), CV |
| Gestion de Proyectos | CRUD de proyectos por laboratorio, estados, cupos |
| Exploracion & Postulacion | Listado con filtros, postulacion con un clic, historial |
| Notificaciones | In-app y por email al cambiar estado de postulacion |
| Matching Alumno-Proyecto | Motor de sugerencias por scoring de habilidades |

## Arquitectura y stack

Ver [`docs/architecture.md`](docs/architecture.md)

## Inicio rapido

### Prerequisitos

- Node.js >= 20
- Docker (para levantar PostgreSQL localmente)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Completar `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lab_frlp
```

### 3. Levantar la base de datos

```bash
npm run docker:up
```

Esto inicia un contenedor PostgreSQL 16 en el puerto `5433`.

### 4. Iniciar los servidores de desarrollo

En terminales separadas:

```bash
# Backend (http://localhost:3000)
npm run dev:back

# Frontend (http://localhost:5173)
npm run dev:front
```

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev:back` | Inicia el backend en modo watch |
| `npm run dev:front` | Inicia el frontend con Vite |
| `npm run docker:up` | Levanta el contenedor de PostgreSQL |
| `npm run docker:down` | Detiene el contenedor de PostgreSQL |

## Documentacion

- [`docs/architecture.md`](docs/architecture.md) — Stack y estructura del proyecto
- [`docs/project-description.md`](docs/project-description.md) — Descripcion completa, objetivos y alcance
- [`docs/decisions/`](docs/decisions/) — Architecture Decision Records (ADRs)
- [`docs/runbook/`](docs/runbook/) — Guias operativas
