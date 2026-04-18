# 003 — Filtros y presentación de proyectos en el dashboard del alumno

## Contexto

El dashboard del alumno expone una sección "Explorar Proyectos" donde se listan todos los proyectos activos con soporte de búsqueda y filtrado. Los filtros deben ser sharable por URL y reactivos sin recargar la página.

## Decisión

### Estado de filtros en la URL (Search Params)

Los tres filtros se persisten como query params:

| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| `q` | string | búsqueda full-text |
| `lab` | string | nombre del laboratorio |
| `skills` | string[] (multi-value) | `?skills=Python&skills=IA` |

El hook `useProjectFilters` encapsula lectura/escritura de estos params con `useSearchParams` de React Router. La búsqueda aplica debounce de 400 ms para no disparar requests en cada keystroke.

### Fetch al backend

`projectsService.findAll()` mapea los filtros a query params y llama a `GET /api/projects`. El backend responde con `{ data: Project[], total: number }`.

### Paginación por "load more"

Se usa offset-based pagination con `limit = 4`. Al cambiar cualquier filtro se resetea a `offset = 0` y se reemplaza la lista. El botón "Mostrar más" acumula resultados sobre la lista existente.

### Opciones de filtro (labs y skills)

Se derivan de la primera respuesta del servidor (conjunto de valores únicos extraídos de los proyectos retornados). Una vez cargadas, no se vuelven a recalcular aunque cambien los filtros, para evitar que las opciones fluctúen mientras el usuario filtra.

### Presentación

Los proyectos se muestran en grilla de 2 columnas (`sm:grid-cols-2`). Durante la carga inicial se renderizan 4 skeletons animados. Si no hay resultados se distingue entre "no hay proyectos" (primera carga vacía) y "ningún proyecto coincide con los filtros".

## Flujo completo

```
Usuario escribe/selecciona filtro
  → useProjectFilters actualiza URL (replace)
  → debouncedQuery (400 ms para q, inmediato para lab/skills)
  → useEffect detecta cambio → setIsLoading(true)
  → projectsService.findAll({ q, lab, skills, limit:4, offset:0 })
  → GET /api/projects?q=...&lab=...&skills=...
  → Backend filtra y pagina → { data, total }
  → setProjects(data), setTotal(total)
```

## Consecuencias

- Los filtros son bookmarkables y compartibles.
- El backend debe aceptar `q`, `lab`, `skills[]`, `limit`, `offset` como query params y aplicar los filtros correspondientes (full-text o ILIKE para `q`, filtro por nombre de laboratorio para `lab`, intersección de skills para `skills[]`).
- Las opciones de labs y skills son estáticas post-primera-carga; en el futuro podría agregarse un endpoint dedicado (`GET /api/projects/options`) si se necesita independencia de los resultados filtrados.
