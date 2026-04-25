# Módulo 2: Perfil del Alumno

## Descripción

Permite que cada alumno registrado complete y mantenga actualizado su perfil con información académica y técnica. Este perfil es la base del sistema de postulaciones y del motor de sugerencias: en lugar de enviar un CV por email en cada postulación, el perfil queda adjunto automáticamente al momento de postularse a un proyecto.

## Funcionalidades a implementar

### Datos del perfil

El alumno puede ver y editar los siguientes campos:

- **Nombre y apellido**
- **Legajo** universitario
- **Año en curso** (1 a 5)
- **Descripción personal** (bio corta, opcional)
- **Enlace a CV externo** (URL a Google Drive, LinkedIn, etc. — opcional)
- **Archivo CV** (subido al servidor — opcional; se almacena la ruta relativa)

### Gestión de habilidades (tags)

- El alumno puede agregar y eliminar **habilidades técnicas y blandas** desde su perfil.
- Las habilidades se representan como etiquetas (`Skill` / `Tag`) que son entidades compartidas con el módulo de proyectos.
- La UI debe ofrecer autocompletado con las habilidades ya existentes en el sistema, y también permitir crear nuevas.
- Las habilidades del alumno son el insumo principal del motor de matching (Módulo 6).

### Endpoints

| Método | Ruta | Roles permitidos | Descripción |
|--------|------|-----------------|-------------|
| `GET` | `/profile/me` | `ALUMNO` | Obtiene el perfil del alumno autenticado |
| `GET` | `/profile/:id` | `RESPONSABLE_LABORATORIO` | Obtiene el perfil de un alumno específico (solo lectura) |
| `PUT` | `/profile/me` | `ALUMNO`, `RESPONSABLE_LABORATORIO` | Actualiza los datos del propio perfil |
| `POST` | `/profile/me/skills` | `ALUMNO`, `RESPONSABLE_LABORATORIO` | Agrega una habilidad al perfil (por ID o creando una nueva) |
| `DELETE` | `/profile/me/skills/:skillId` | `ALUMNO`, `RESPONSABLE_LABORATORIO` | Elimina una habilidad del perfil |

Todos los endpoints están protegidos con `JwtAuthGuard` y `RolesGuard`. Tanto el alumno como el responsable pueden ver y editar su propio perfil; `GET /profile/:id` es exclusivo para que el responsable evalúe candidatos.

#### Body de `POST /profile/me/skills` (`AddSkillDto`)

Se debe enviar exactamente una de las dos opciones:

- **Agregar skill existente:** `{ "skillId": "<uuid>" }`
- **Crear skill nueva:** `{ "nombre": "TypeScript", "categoria": "Programación" }` (`categoria` es opcional)

La validación de que al menos uno de los dos campos esté presente se realiza en el servicio.

## Estructura de código sugerida

### Backend — `src/modules/alumno/`

```
alumno/
├── alumno.module.ts
├── alumno.controller.ts
├── alumno.service.ts
├── entities/
│   └── alumno.entity.ts   # relación 1:1 con User
└── dto/
    ├── create-alumno.dto.ts
    └── update-alumno.dto.ts
```

### Entidad `Alumno`

```typescript
@Entity()
export class Alumno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: User;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  apellido: string;

  @Column({ nullable: true })
  legajo: string;

  @Column({ nullable: true })
  anioEnCurso: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  cvUrl: string;

  @Column({ nullable: true })
  cvArchivoPath: string;

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable()
  skills: Skill[];

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Frontend — `src/`

```
pages/
└── ProfilePage.tsx          # formulario de edición del perfil

components/profile/
├── ProfileForm.tsx           # campos editables (nombre, legajo, carrera, etc.)
└── SkillsInput.tsx           # input con autocompletado y chips para habilidades
```

## Entidad compartida: `Skill`

Las habilidades son entidades propias del sistema usadas tanto por alumnos (perfil) como por proyectos (requisitos). Están en su propio módulo:

```
src/modules/skills/
├── skills.module.ts
├── skills.controller.ts     # GET /skills · POST /skills
├── skills.service.ts
└── entities/
    └── skill.entity.ts
```

### Entidad `Skill`

```typescript
@Entity()
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  categoria: string | null;

  @Column({ default: false })
  esPredefinida: boolean;       // true = skill del sistema; false = creada por un alumno

  @Column({ nullable: true })
  creadaPorAlumnoId: string | null;  // UUID del alumno que la creó (si aplica)
}
```

### Endpoints de skills

| Método | Ruta | Guards | Descripción |
|--------|------|--------|-------------|
| `GET` | `/skills` | `JwtAuthGuard` | Lista todas las skills (para autocompletado en la UI) |
| `POST` | `/skills` | `JwtAuthGuard` | Crea una skill nueva (sin restricción de rol) |

Las skills creadas vía `POST /skills` se marcan con `esPredefinida: false` y `creadaPorAlumnoId: null`. Las creadas al agregar una skill nueva al perfil (`POST /profile/me/skills` con `nombre`) quedan asociadas al alumno que las creó.

## Consideraciones

- El registro `Alumno` se crea automáticamente con los datos básicos cuando el usuario se registra.
- Al postularse a un proyecto (Módulo 4), el responsable puede acceder a este perfil en modo **solo lectura** para evaluar al candidato.
- El alumno puede cargar `cvArchivoPath` (archivo al servidor), `cvUrl` (link externo), ambos, o ninguno. Ambos campos son nullables.
- La completitud del perfil (con habilidades cargadas) impacta directamente en la calidad de las sugerencias del motor de matching.
