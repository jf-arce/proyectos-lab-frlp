# Módulo 6: Matching Alumno-Proyecto (Motor de Sugerencias)

## Descripción

Sugiere al alumno los proyectos más relevantes según la compatibilidad entre sus habilidades declaradas y las habilidades requeridas por cada proyecto activo. Es la funcionalidad "inteligente" de la plataforma: en lugar de que el alumno explore ciegamente el listado completo, se le presenta una vista personalizada ordenada por relevancia.

El algoritmo es deliberadamente simple y determinista (basado en intersección de sets), lo que lo hace eficiente, predecible y auditable sin necesidad de modelos de ML.

## Algoritmo de scoring

Para cada proyecto activo, el puntaje se calcula como:

```
score = |habilidades_alumno ∩ habilidades_requeridas_proyecto| / |habilidades_requeridas_proyecto|
```

- **Resultado:** número entre 0 y 1 (o porcentaje de 0 a 100).
- Un proyecto sin habilidades requeridas tiene score 0 (no hay base de comparación) y queda al final.
- Los proyectos ya postulados por el alumno se excluyen.
- Los proyectos con `status = CLOSED` se excluyen.
- Los proyectos con score 0 pueden incluirse al final o excluirse según criterio de UX.

### Ejemplo

- Habilidades del alumno: `[Python, Machine Learning, SQL]`
- Proyecto A requiere: `[Python, TensorFlow, SQL]` → intersección: `[Python, SQL]` → score: 2/3 = **67%**
- Proyecto B requiere: `[React, TypeScript]` → intersección: `[]` → score: 0/2 = **0%**
- Proyecto C requiere: `[Python]` → intersección: `[Python]` → score: 1/1 = **100%**

Resultado ordenado: C (100%) → A (67%) → B (0%).

## Funcionalidades a implementar

### Endpoint de sugerencias

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/projects/recommended` | ALUMNO | Proyectos activos ordenados por score de compatibilidad |

La respuesta incluye el score junto a los datos del proyecto:

```json
[
  {
    "score": 1.0,
    "project": { "id": "...", "title": "...", "laboratory": { ... }, "skills": [ ... ] }
  },
  {
    "score": 0.67,
    "project": { ... }
  }
]
```

### Recálculo dinámico

- El score **no se persiste en BD**; se calcula en cada request.
- Cuando el alumno actualiza su perfil (agrega/quita habilidades), la próxima vez que visite "Proyectos recomendados" verá resultados actualizados automáticamente.
- Si el volumen de proyectos crece significativamente, se puede considerar caché por usuario con invalidación al actualizar el perfil.

## Estructura de código sugerida

### Backend

El cálculo puede vivir dentro de `projects.service.ts` o en un servicio propio:

```
projects/
└── matching.service.ts    # lógica de scoring, inyecta ProjectRepository y StudentProfileRepository
```

```typescript
// matching.service.ts
async getRecommendations(userId: string): Promise<ScoredProject[]> {
  const profile = await this.profileRepo.findOne({
    where: { user: { id: userId } },
    relations: ['skills'],
  });
  const studentSkillIds = new Set(profile.skills.map(s => s.id));

  const projects = await this.projectRepo.find({
    where: { status: ProjectStatus.ACTIVE },
    relations: ['skills', 'laboratory'],
  });

  // Excluir proyectos ya postulados
  const applications = await this.applicationRepo.find({
    where: { student: { id: userId } },
    relations: ['project'],
  });
  const appliedProjectIds = new Set(applications.map(a => a.project.id));

  return projects
    .filter(p => !appliedProjectIds.has(p.id))
    .map(p => {
      const required = p.skills.length;
      if (required === 0) return { score: 0, project: p };
      const matches = p.skills.filter(s => studentSkillIds.has(s.id)).length;
      return { score: matches / required, project: p };
    })
    .sort((a, b) => b.score - a.score);
}
```

### Frontend — `src/`

```
pages/
└── RecommendedProjectsPage.tsx    # vista "Para ti" o "Proyectos recomendados"

components/projects/
└── ScoredProjectCard.tsx          # tarjeta con barra de progreso o porcentaje de match
```

## UX sugerida

- Sección "Proyectos recomendados para ti" accesible desde el menú principal o desde el dashboard del alumno.
- Cada tarjeta muestra el porcentaje de coincidencia con el perfil (e.g., badge "85% match").
- Si el alumno no tiene habilidades cargadas, mostrar un mensaje que lo invite a completar su perfil con un link directo.
- Separar visualmente proyectos con score > 0 de los que tienen score 0 (o directamente no mostrar los de score 0).

## Consideraciones

- El algoritmo actual es **intersección simple (Jaccard-like)**. Si en el futuro se quiere mayor sofisticación (pesos por habilidad, categorías de habilidades, antigüedad del alumno), el servicio de matching es el único lugar a modificar.
- Para MVP, el cálculo en cada request es aceptable dado que el volumen de proyectos en un laboratorio universitario es bajo (< 100 proyectos activos). No optimizar prematuramente.
- Si se decide cachear, usar `Map<userId, ScoredProject[]>` en memoria con timestamp, o Redis si ya está disponible en la infraestructura.
- Los proyectos excluidos del matching (postulados, cerrados) deben aun ser accesibles desde el listado general — solo se excluyen de la vista de recomendaciones.
