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

**Funcionalidades:**

* Registro con email y contraseña (con validación y hasheo seguro).  
* Autenticación mediante email y contraseña con emisión de token JWT.  
* Dos roles principales: ALUMNO y RESPONSABLE LABORATORIO.  
* Rutas y endpoints protegidos según rol (Guards en backend, rutas protegidas en frontend).  
* El rol RESPONSABLE LABORATORIO está asociado a un laboratorio específico; solo puede gestionar los proyectos de ese laboratorio.  
* Expiración configurable del token y manejo de sesión en frontend.

### **3.2 Módulo 2: Perfil del Alumno**

Permite que el alumno complete y administre su información personal relevante para la postulación a proyectos.

**Funcionalidades:**

* Perfil editable: datos personales, legajo, carrera, año en curso.  
* Carga de habilidades técnicas y blandas mediante etiquetas (tags).  
* Carga o enlace a CV (opcional).  
* El perfil completo queda disponible automáticamente al momento de postularse, sin necesidad de adjuntar manualmente.

### **3.3 Módulo 3: Gestión de Proyectos por Laboratorio**

Permite a los responsables de laboratorio publicar, editar y administrar los proyectos activos de su laboratorio.

**Funcionalidades:**

* CRUD completo de proyectos (título, descripción, requisitos, cupo, estado: activo/cerrado).  
* Asociación de etiquetas de habilidades requeridas por proyecto.  
* Visualización del listado de postulaciones recibidas por proyecto.  
* Cambio de estado de una postulación (pendiente, aceptada, rechazada).  
* Control de acceso: solo el responsable del laboratorio asociado puede gestionar sus proyectos.

### **3.4 Módulo 4: Exploración y Postulación Online**

Permite a los alumnos descubrir proyectos disponibles y postularse desde la plataforma.

**Funcionalidades:**

* Listado de proyectos activos con filtros por laboratorio, área temática y habilidades requeridas.  
* Vista de detalle de cada proyecto con información completa y datos del laboratorio.  
* Postulación con un clic: el sistema adjunta automáticamente el perfil del alumno.  
* Historial de postulaciones del alumno con estado actualizado de cada una.  
* Un alumno no puede postularse dos veces al mismo proyecto.

### **3.5 Módulo 5: Notificaciones**

Mantiene informados a los usuarios sobre eventos relevantes dentro de la plataforma.

**Funcionalidades:**

* Notificación al alumno cuando el estado de su postulación cambia (aceptada / rechazada).  
* Notificación al responsable de laboratorio cuando un nuevo alumno se postula a uno de sus proyectos.  
* Notificaciones in-app: indicador de no leídas accesible desde el header de la aplicación.  
* Notificaciones por email para eventos clave (configurables).

### **3.6 Módulo 6: Matching Alumno-Proyecto (Motor de Sugerencias)**

Sugiere proyectos relevantes al alumno en función de la compatibilidad entre su perfil y los requisitos de cada proyecto.

**Funcionalidades:**

* Algoritmo de scoring basado en la intersección entre las habilidades del alumno y las etiquetas requeridas por el proyecto.  
* Vista personalizada de "Proyectos recomendados" ordenada por puntaje de compatibilidad.  
* El puntaje se recalcula dinámicamente al actualizar el perfil del alumno.  
* Los proyectos ya postulados o cerrados quedan excluidos de las sugerencias.