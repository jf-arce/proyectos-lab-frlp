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

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/profile/me` | Obtiene el perfil del alumno autenticado |
| `GET` | `/profile/:id` | Obtiene el perfil de un alumno específico (uso del responsable) |
| `PUT` | `/profile/me` | Actualiza los datos del perfil |
| `POST` | `/profile/me/skills` | Agrega habilidades al perfil |
| `DELETE` | `/profile/me/skills/:skillId` | Elimina una habilidad del perfil |

Los endpoints de edición requieren rol `ALUMNO`. El endpoint `GET /profile/:id` permite acceso tanto a `ALUMNO` (propio) como a `RESPONSABLE_LABORATORIO` para la revisión de candidatos.

## Estructura de código sugerida

### Backend — `src/modules/alumnos/`

```
alumnos/
├── alumnos.module.ts
├── alumnos.controller.ts
├── alumnos.service.ts
├── entities/
│   └── alumno.entity.ts   # relación 1:1 con User
└── dto/
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

Las habilidades son entidades propias del sistema usadas tanto por alumnos (perfil) como por proyectos (requisitos). Conviene colocarlas en un módulo propio o en un módulo compartido (`skills`):

```
src/modules/skills/
├── skills.module.ts
├── skills.controller.ts     # GET /skills (listar todas, para autocompletado)
├── skills.service.ts
└── entities/
    └── skill.entity.ts      # { id, name, category? }
```

## Consideraciones

- El registro `Alumno` se crea automáticamente con los datos básicos cuando el usuario se registra.
- Al postularse a un proyecto (Módulo 4), el responsable puede acceder a este perfil en modo **solo lectura** para evaluar al candidato.
- El alumno puede cargar `cvArchivoPath` (archivo al servidor), `cvUrl` (link externo), ambos, o ninguno. Ambos campos son nullables.
- La completitud del perfil (con habilidades cargadas) impacta directamente en la calidad de las sugerencias del motor de matching.
