# Modelo de datos: Portal de Gestión de Proyectos de Laboratorio

## Contexto y alcance

La plataforma centraliza la publicación de proyectos de laboratorio y la postulación de alumnos de la carrera de Sistemas de UTN FRLP. El sistema es exclusivo para esta carrera. No reemplaza la inscripción oficial a la Práctica Supervisada, que continúa siendo gestionada por el Departamento de Sistemas.

---

## Decisiones de diseño

- **Un responsable gestiona un solo laboratorio.** La relación es 1:1 entre `RESPONSABLE_LABORATORIO` y `LABORATORIO`. Si en el futuro se requiere que un responsable gestione varios laboratorios, esta FK se migra a una tabla pivote.
- **Skills con dos modos.** Existe un catálogo predefinido de habilidades (gestionado por el sistema) y la posibilidad de que cada alumno agregue skills personalizadas propias. Los responsables de laboratorio solo pueden usar el catálogo predefinido al definir los requisitos de un proyecto.
- **Repostulación controlada por backend.** La base de datos permite múltiples postulaciones de un mismo alumno a un mismo proyecto en distintos momentos. La lógica de restricción temporal (por ejemplo, no repostularse hasta pasados X días de un rechazo) se implementa en la capa de negocio del backend.
- **CV con doble modalidad.** El alumno puede cargar un archivo al servidor, indicar un link externo, o ambos. Ambos campos son opcionales (nullables).
- **Notificaciones in-app y por email.** Cada notificación registra su estado de lectura in-app (`leida`) y si el email correspondiente fue despachado (`email_enviado`).
- **Refresh tokens persistidos.** Al hacer login se emite un refresh token opaco que se hashea con bcrypt y se persiste en `REFRESH_TOKEN` con fecha de expiración. Esto permite renovar el access token (vida corta: 15 min) sin requerir un nuevo login, e invalida sesiones individuales en el logout.

---

## Entidades

### USUARIO

Tabla base de autenticación. Todo usuario del sistema, independientemente de su rol, tiene un registro aquí.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `email` | string | Email único, usado para login |
| `password` | string | Contraseña hasheada (bcrypt) |
| `rol` | string | Valores: `ALUMNO`, `RESPONSABLE_LABORATORIO` |
| `created_at` | timestamp | Fecha de registro |

---

### REFRESH_TOKEN

Tokens opacos emitidos al hacer login. Se persisten hasheados para validar renovaciones del access token sin requerir un nuevo login.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `usuario_id` | uuid FK | Usuario al que pertenece |
| `token_hash` | string | Hash bcrypt del token opaco |
| `expira_en` | timestamp | Fecha de expiración (7 días desde emisión) |
| `created_at` | timestamp | Fecha de creación |

---

### ALUMNO

Perfil extendido del usuario con rol `ALUMNO`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `usuario_id` | uuid FK | Referencia a `USUARIO` |
| `legajo` | string | Legajo universitario |
| `nombre` | string | Nombre del alumno |
| `apellido` | string | Apellido del alumno |
| `anio_en_curso` | int | Año de la carrera que está cursando |
| `bio` | string (nullable) | Descripción personal corta (opcional) |
| `cv_url` | string (nullable) | Link externo al CV (LinkedIn, Drive, etc.) |
| `cv_archivo_path` | string (nullable) | Ruta del archivo CV subido al servidor |
| `updated_at` | timestamp | Última actualización del perfil |

---

### RESPONSABLE_LABORATORIO

Perfil extendido del usuario con rol `RESPONSABLE_LABORATORIO`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `usuario_id` | uuid FK | Referencia a `USUARIO` |
| `laboratorio_id` | uuid FK | Laboratorio que gestiona (uno solo) |
| `nombre` | string | Nombre del responsable |
| `apellido` | string | Apellido del responsable |

---

### LABORATORIO

Representa cada laboratorio de la facultad que publica proyectos en la plataforma.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `nombre` | string | Nombre del laboratorio (ej: LINSI) |
| `descripcion` | string | Descripción general del laboratorio |
| `email_contacto` | string (nullable) | Email de contacto del laboratorio |

---

### PROYECTO

Proyecto publicado por un laboratorio al cual los alumnos pueden postularse.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `laboratorio_id` | uuid FK | Laboratorio que lo publica |
| `titulo` | string | Título del proyecto |
| `descripcion` | string | Descripción detallada |
| `estado` | string | Valores: `ACTIVO`, `CERRADO` |
| `created_at` | timestamp | Fecha de publicación |
| `updated_at` | timestamp | Última modificación |

---

### SKILL

Catálogo de habilidades técnicas y blandas. Incluye tanto las predefinidas por el sistema como las creadas por alumnos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `nombre` | string | Nombre de la habilidad (ej: Python, SQL) |
| `categoria` | string | Agrupación temática (ej: Lenguajes, Bases de datos) |
| `es_predefinida` | boolean | `true` si es del catálogo del sistema, `false` si la creó un alumno |
| `creada_por_alumno_id` | uuid FK (nullable) | Referencia al alumno que la creó; null si es predefinida |

> Los responsables de laboratorio solo pueden seleccionar skills del catálogo predefinido (`es_predefinida = true`) al definir los requisitos de un proyecto.

---

### ALUMNO_SKILL

Tabla pivote. Registra las habilidades declaradas por cada alumno en su perfil.

| Campo | Tipo | Descripción |
|---|---|---|
| `alumno_id` | uuid FK | Referencia a `ALUMNO` |
| `skill_id` | uuid FK | Referencia a `SKILL` |

---

### PROYECTO_SKILL

Tabla pivote. Registra las habilidades requeridas por cada proyecto.

| Campo | Tipo | Descripción |
|---|---|---|
| `proyecto_id` | uuid FK | Referencia a `PROYECTO` |
| `skill_id` | uuid FK | Referencia a `SKILL` |

> La intersección entre `ALUMNO_SKILL` y `PROYECTO_SKILL` es la base del algoritmo de matching: el score de compatibilidad se calcula comparando los `skill_id` del alumno contra los del proyecto.

---

### POSTULACION

Registra la postulación de un alumno a un proyecto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `alumno_id` | uuid FK | Alumno que se postula |
| `proyecto_id` | uuid FK | Proyecto al que se postula |
| `estado` | string | Valores: `PENDIENTE`, `ACEPTADA`, `RECHAZADA` |
| `created_at` | timestamp | Fecha de postulación |
| `updated_at` | timestamp | Última actualización de estado |

> La lógica de repostulación (permitir volver a postularse luego de un rechazo pasado cierto tiempo) se implementa en el backend. La base de datos no impone restricción de unicidad sobre `(alumno_id, proyecto_id)`.

---

### NOTIFICACION

Registra los eventos relevantes generados para cada usuario. Soporta tanto visualización in-app como envío por email.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Clave primaria |
| `usuario_id` | uuid FK | Usuario destinatario |
| `postulacion_id` | uuid FK | Postulación que originó la notificación |
| `tipo` | string | Ej: `NUEVA_POSTULACION`, `ESTADO_ACTUALIZADO` |
| `mensaje` | string | Texto de la notificación |
| `leida` | boolean | Si el usuario la leyó in-app |
| `email_enviado` | boolean | Si el email fue despachado exitosamente |
| `created_at` | timestamp | Fecha de creación |

---

## Relaciones

| Relación | Cardinalidad | Descripción |
|---|---|---|
| `USUARIO` → `REFRESH_TOKEN` | 1:N | Un usuario puede tener varios refresh tokens activos |
| `USUARIO` → `ALUMNO` | 1:0..1 | Un usuario puede tener perfil de alumno |
| `USUARIO` → `RESPONSABLE_LABORATORIO` | 1:0..1 | Un usuario puede ser responsable de laboratorio |
| `LABORATORIO` → `RESPONSABLE_LABORATORIO` | 1:N | Un laboratorio tiene uno o más responsables |
| `LABORATORIO` → `PROYECTO` | 1:N | Un laboratorio publica varios proyectos |
| `ALUMNO` → `POSTULACION` | 1:N | Un alumno realiza varias postulaciones |
| `PROYECTO` → `POSTULACION` | 1:N | Un proyecto recibe varias postulaciones |
| `ALUMNO` → `ALUMNO_SKILL` | 1:N | Un alumno declara varias habilidades |
| `SKILL` → `ALUMNO_SKILL` | 1:N | Una skill puede estar en varios perfiles |
| `PROYECTO` → `PROYECTO_SKILL` | 1:N | Un proyecto requiere varias habilidades |
| `SKILL` → `PROYECTO_SKILL` | 1:N | Una skill puede requerirse en varios proyectos |
| `USUARIO` → `NOTIFICACION` | 1:N | Un usuario recibe varias notificaciones |
| `POSTULACION` → `NOTIFICACION` | 1:N | Una postulación puede generar varias notificaciones |
| `ALUMNO` → `SKILL` | 1:N | Un alumno puede crear skills personalizadas |

---

## Notas de implementación

- El campo `password` en `USUARIO` almacena el hash generado con **bcrypt**. Nunca se persiste la contraseña en texto plano.
- El campo `token_hash` en `REFRESH_TOKEN` almacena el hash bcrypt del token opaco. El token en texto claro se envía al cliente una sola vez; nunca se vuelve a almacenar sin hashear.
- Los campos `cv_url` y `cv_archivo_path` en `ALUMNO` son ambos nullables. El alumno puede completar uno, el otro, o los dos.
- El campo `creada_por_alumno_id` en `SKILL` es nullable. Es null para todas las skills predefinidas del catálogo y apunta al alumno creador solo para skills personalizadas.
- Los archivos de CV subidos al servidor se almacenan en el sistema de archivos local del servidor. La ruta relativa se persiste en `cv_archivo_path`.
- El algoritmo de matching compara los `skill_id` registrados en `ALUMNO_SKILL` contra los de `PROYECTO_SKILL` para calcular un score de compatibilidad por proyecto.
