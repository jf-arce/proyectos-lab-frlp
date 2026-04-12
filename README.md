# Portal de Proyectos de Laboratorio — FRLP

Plataforma web para que alumnos de la facultad exploren proyectos de laboratorio y se postulen online, reemplazando el proceso informal por email/presencial. Los responsables de laboratorio publican y gestionan proyectos y postulaciones.

## Descripcion y modulos

Ver [`docs/project-description.md`](docs/project-description.md) para descripcion completa, objetivos y modulos.

## Arquitectura y stack

Ver [`docs/architecture.md`](docs/architecture.md)

## Inicio rapido

> Para setup detallado, variante cloud DB y troubleshooting ver [`docs/runbook/local-development.md`](docs/runbook/local-development.md).

### Prerequisitos

- Node.js >= 20
- Docker (para PostgreSQL local)

### Setup

```bash
npm install
cp backend/.env.example backend/.env  # completar con los valores de abajo
npm run docker:up
```

`backend/.env` minimo:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lab_frlp
```

Iniciar servidores (terminales separadas):

```bash
npm run dev:back    # http://localhost:3000
npm run dev:front   # http://localhost:5173
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
