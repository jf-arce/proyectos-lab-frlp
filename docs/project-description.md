# Portal de Gestión de Proyectos de Laboratorio  

## **1\. Descripción**

Actualmente, el proceso por el cual un alumno conoce los proyectos disponibles en los laboratorios de la facultad y manifiesta su interés en participar se realiza de forma informal, principalmente por correo electrónico o de manera presencial. Esto genera demoras y dificulta tanto la visibilidad para el alumno como la organización para los laboratorios.

La propuesta consiste en desarrollar una **plataforma web** donde cada laboratorio pueda publicar sus proyectos activos y necesidades, y los alumnos puedan explorarlos y postularse de forma online. Al registrarse, el alumno completa su perfil con sus datos y habilidades, de modo que al postularse a un proyecto esa información quede disponible automáticamente para el responsable del laboratorio, sin necesidad de intercambios adicionales por correo.

Es importante aclarar que el alcance de esta plataforma es **informativo y organizativo**: no reemplaza ni abarca la inscripción oficial a la Práctica Supervisada, la cual continúa siendo gestionada por el Departamento de Sistemas. El objetivo es simplificar y agilizar el contacto inicial entre el alumno y el laboratorio.

Como funcionalidad complementaria, el sistema incorpora un **motor de sugerencias automáticas** que recomienda proyectos según el perfil y las habilidades declaradas por el alumno.

## **2\. Objetivo del Proyecto**

Diseñar y desarrollar una aplicación web completa (frontend y backend) que permita centralizar la publicación de proyectos de laboratorio y la postulación de alumnos, eliminando la informalidad del proceso actual.

El sistema se enfocara en:

* Proveer una interfaz intuitiva para que los alumnos exploren y se postulen a proyectos.  
* Permitir a los responsables de laboratorio gestionar sus proyectos y postulaciones recibidas.  
* Implementar un sistema de roles con acceso diferenciado por tipo de usuario.  
* Incorporar un algoritmo de matching que sugiera proyectos afines al perfil del alumno.  
* Exponer una API REST documentada que desacople completamente el frontend del backend.  
* Garantizar autenticación segura mediante JWT y control de acceso basado en roles.

## **3\. Alcance**

### **3.1 Módulo 1: Autenticación y Roles**

Gestiona el acceso al sistema y define los permisos según el tipo de usuario.

* Registro y login con email/contraseña y emisión de token JWT.
* Dos roles: `ALUMNO` y `RESPONSABLE_LABORATORIO`.
* Rutas y endpoints protegidos por guards según rol.
* El responsable queda vinculado a un laboratorio específico.

→ Detalle completo en [`docs/modules/01-auth-roles.md`](modules/01-auth-roles.md)

### **3.2 Módulo 2: Perfil del Alumno**

Permite que el alumno complete y administre su información personal relevante para la postulación.

* Perfil editable: datos personales, legajo, carrera, año en curso.
* Habilidades técnicas y blandas como etiquetas (tags).
* Enlace a CV (opcional).
* El perfil se adjunta automáticamente al postularse, sin pasos adicionales.

→ Detalle completo en [`docs/modules/02-perfil-alumno.md`](modules/02-perfil-alumno.md)

### **3.3 Módulo 3: Gestión de Proyectos por Laboratorio**

Permite a los responsables publicar, editar y administrar los proyectos de su laboratorio.

* CRUD completo de proyectos (título, descripción, requisitos, cupo, estado).
* Habilidades requeridas por proyecto mediante etiquetas.
* Listado de postulaciones recibidas con cambio de estado (pendiente / aceptada / rechazada).
* Control de acceso: cada responsable solo gestiona su propio laboratorio.

→ Detalle completo en [`docs/modules/03-gestion-proyectos.md`](modules/03-gestion-proyectos.md)

### **3.4 Módulo 4: Exploración y Postulación Online**

Permite a los alumnos descubrir proyectos disponibles y postularse desde la plataforma.

* Listado de proyectos activos con filtros por laboratorio, habilidades y texto libre.
* Vista de detalle de cada proyecto con información completa.
* Postulación con un clic; un alumno no puede postularse dos veces al mismo proyecto.
* Historial de postulaciones del alumno con estado actualizado.

→ Detalle completo en [`docs/modules/04-exploracion-postulacion.md`](modules/04-exploracion-postulacion.md)

### **3.5 Módulo 5: Notificaciones**

Mantiene informados a los usuarios sobre eventos relevantes dentro de la plataforma.

* Notificación al alumno cuando su postulación es aceptada o rechazada.
* Notificación al responsable cuando un alumno se postula a uno de sus proyectos.
* Notificaciones in-app con indicador de no leídas en el header.
* Notificaciones por email para eventos clave.

→ Detalle completo en [`docs/modules/05-notificaciones.md`](modules/05-notificaciones.md)

### **3.6 Módulo 6: Matching Alumno-Proyecto (Motor de Sugerencias)**

Sugiere proyectos relevantes al alumno según la compatibilidad con su perfil.

* Scoring basado en la intersección entre habilidades del alumno y requisitos del proyecto.
* Vista personalizada "Proyectos recomendados" ordenada por puntaje.
* Puntaje recalculado dinámicamente al actualizar el perfil.
* Proyectos ya postulados o cerrados excluidos de las sugerencias.

→ Detalle completo en [`docs/modules/06-matching.md`](modules/06-matching.md)