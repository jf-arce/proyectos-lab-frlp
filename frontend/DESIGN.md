# Design System: Portal de Gestión de PS y Proyectos de Laboratorio

## 1. Visión de diseño

**"The Academic Curator"** — Una plataforma institucional sin ser burocrática. Precisa sin ser fría.

### Principios
- **Jerarquía por superficie, no por bordes.** Los bloques se distinguen con cambios de fondo, no líneas de 1px.
- **Espaciado generoso.** Más margen = más credibilidad institucional.
- **New York style:** compacto, denso, ideal para dashboards con datos.
- **Sombras ambientales.** Sutiles (opacidad < 8%, blur alto).

---

## 2. Arquitectura CSS

El archivo de estilos global es `src/index.css`. Utiliza Tailwind CSS v4 sin archivo de configuración separado — todo se define en el CSS.

### Imports

```css
@import "tailwindcss";
@import "tw-animate-css";          /* animaciones — no usar tailwindcss-animate */
@import "shadcn/tailwind.css";     /* tokens base de shadcn */
@import "@fontsource-variable/manrope";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
```

### Bloques del archivo

| Bloque | Propósito |
|---|---|
| `@theme inline` | Mapea variables CSS a utilidades Tailwind. Define `--font-sans`, `--font-display`, `--shadow-card`, `--shadow-card-hover`, `--shadow-nav` y todos los tokens de color de shadcn. |
| `:root` | Tokens de color para light mode — paleta institucional UTN sobre base neutral fría (hue 247–252). |
| `.dark` | Tokens de color para dark mode — el fondo mantiene un tinte azul UTN sutil (`hue 252, chroma 0.015`) en lugar de negro neutro. `--primary` sube de `oklch(0.26)` a `oklch(0.65)` para mantener legibilidad sobre fondos oscuros. |
| `@layer base` | Estilos base: `border-border`, `bg-background`, `font-sans` en `html`, y `font-family: var(--font-display)` en `h1`–`h4`. |
| `.status-accepted / .status-pending / .status-rejected` | Clases de estado definidas fuera de `@layer` para que apliquen sin conflicto de especificidad. Consumen los tokens `--status-*-bg` y `--status-*-fg`. |

### Tokens custom del proyecto

```css
/* En @theme inline */
--font-sans:    'Inter', sans-serif;
--font-display: 'Manrope Variable', sans-serif;

--shadow-card:       0 2px 32px 0 oklch(0.26 0.07 252 / 0.05);
--shadow-card-hover: 0 4px 48px 0 oklch(0.26 0.07 252 / 0.08);
--shadow-nav:        0 1px 24px 0 oklch(0.26 0.07 252 / 0.06);
```

---

## 3. Paleta de colores

### Light mode

| Token | OKLCH | Hex aprox. | Uso |
|---|---|---|---|
| `--primary` | `oklch(0.396 0.111 253)` | `#00244b` | Acciones principales, nav activa, botones |
| `--background` | `oklch(0.98 0.003 247)` | `#f8f9fa` | Fondo de página |
| `--card` | `oklch(1 0 0)` | `#ffffff` | Cards elevadas |
| `--muted` | `oklch(0.96 0.003 247)` | `#f3f4f5` | Fondos de sección, inputs |
| `--muted-foreground` | `oklch(0.52 0.007 247)` | `#6b7280` | Texto secundario, placeholders |
| `--border` | `oklch(0.90 0.005 247)` | `#dde1e7` | Bordes sutiles |
| `--destructive` | `oklch(0.577 0.245 27)` | `#dc2626` | Errores, rechazos |

### Tokens de estado

| Token | Light mode | Dark mode |
|---|---|---|
| `--status-accepted-bg/fg` | Verde claro / verde oscuro | Verde oscuro saturado / verde claro |
| `--status-pending-bg/fg` | Amarillo claro / ámbar oscuro | Ámbar oscuro saturado / ámbar claro |
| `--status-rejected-bg/fg` | Rojo claro / rojo oscuro | Rojo oscuro saturado / rojo claro |

---

## 4. Tipografía

El sistema usa dos fuentes con roles diferenciados:

- **`font-display`** → `Manrope Variable`, peso 600–800. Se aplica automáticamente a `h1`–`h4` vía `@layer base`. Usar en títulos y elementos de marca.
- **`font-sans`** → `Inter`, peso 400–600. Fuente por defecto del `body`. Usar en textos, labels, tablas, formularios.

```tsx
<h1 className="font-display text-2xl font-semibold tracking-tight">
  Proyectos disponibles
</h1>

<p className="text-sm text-muted-foreground">
  Descripción del proyecto...
</p>

<span className="text-xs text-muted-foreground font-medium">
  Publicado hace 3 días · LINSI
</span>
```

---

## 5. Sistema de superficies

La jerarquía visual se construye cambiando el color de fondo entre capas, sin bordes divisores de 1px.

```
bg-background (#f8f9fa)     ← fondo de página
  └── bg-muted (#f3f4f5)    ← secciones internas, filtros, sidebars
        └── bg-card (#fff)  ← cards elevadas ("flotadas")
              └── bg-muted  ← áreas destacadas dentro de una card
```

```tsx
// separación por superficie
<div className="bg-background min-h-screen">
  <section className="bg-muted/60 py-8">
    <Card className="bg-card shadow-card">
      <CardContent>
        <div className="bg-muted rounded-md p-4">contenido destacado</div>
      </CardContent>
    </Card>
  </section>
</div>

// evitar — borde divisor de 1px
<div className="border-b border-border">...</div>
```

---

## 6. Componentes del proyecto

### StatusBadge

**Archivo:** `src/components/ui/status-badge.tsx`

Muestra el estado de una postulación o proyecto como una etiqueta pill. Es un componente propio (no el `Badge` de shadcn) porque consume los tokens de color semánticos `--status-*`.

| Prop | Tipo | Descripción |
|---|---|---|
| `status` | `"pending" \| "accepted" \| "rejected" \| "active" \| "closed"` | Estado a mostrar |

```tsx
<StatusBadge status="pending" />
<StatusBadge status="accepted" />
```

### SkillTag

**Archivo:** `src/components/ui/skill-tag.tsx`

Etiqueta pill para habilidades. Opcionalmente incluye botón de remoción.

| Prop | Tipo | Descripción |
|---|---|---|
| `children` | `React.ReactNode` | Texto de la habilidad |
| `removable` | `boolean?` | Muestra el botón × |
| `onRemove` | `() => void?` | Callback al hacer click en × |
| `className` | `string?` | Clases adicionales |

```tsx
<SkillTag>React</SkillTag>
<SkillTag removable onRemove={() => remove(skill)}>TypeScript</SkillTag>
```

### ProjectCard

**Archivo:** `src/components/alumno/project-card.tsx` *(o la ruta donde viva)*

Card de proyecto para el listado del alumno. Combina `Card` de shadcn con `StatusBadge` y `SkillTag`. Usa `shadow-card` y la transición `hover:shadow-card-hover`.

### Navbar

**Archivo:** `src/components/layout/navbar.tsx` *(o la ruta donde viva)*

Header sticky con `bg-card/80 backdrop-blur-sm shadow-nav`. Contiene el logo, el botón de notificaciones y el dropdown de usuario.

### AppSidebar

**Archivo:** `src/components/layout/app-sidebar.tsx`

Sidebar para el rol responsable de laboratorio. Construido sobre el componente `Sidebar` de shadcn. Los ítems de navegación usan `NavLink` de React Router; el ítem activo recibe `bg-primary text-primary-foreground`.

---

## 7. Layouts por rol

### StudentLayout — `src/layouts/StudentLayout.tsx`

Navbar superior + contenido centrado. Sin sidebar.

```tsx
<div className="min-h-screen bg-background">
  <Navbar />
  <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
    <Outlet />
  </main>
</div>
```

### LabLayout — `src/layouts/LabLayout.tsx`

Sidebar izquierdo (`AppSidebar`) + área de contenido (`SidebarInset`) con su propia Navbar. Usa `SidebarProvider` de shadcn.

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <Navbar />
    <main className="px-6 py-8 max-w-4xl">
      <Outlet />
    </main>
  </SidebarInset>
</SidebarProvider>
```

---

## 8. Formularios

Los formularios usan `react-hook-form` + Zod + el wrapper `<Form>` de shadcn (`src/components/ui/form.tsx`).

Patrón de campo estándar:

```tsx
<div className="space-y-1.5">
  <Label htmlFor="email">Correo electrónico</Label>
  <Input
    id="email"
    type="email"
    placeholder="legajo@frlp.utn.edu.ar"
    className="bg-muted/50 focus-visible:ring-primary/30"
  />
</div>
```

---

## 9. Espaciado de referencia

| Contexto | Clase |
|---|---|
| Gap entre elementos inline | `gap-1.5` |
| Gap entre campos de form | `space-y-4` |
| Padding de card | `p-5` o `p-6` |
| Gap entre cards en grid | `gap-4` |
| Separación entre secciones | `mt-8` o `mt-10` |
| Padding de página | `px-4 md:px-6 py-8` |
| Grid de proyectos | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` |
| Ancho máximo de contenido | `max-w-5xl` |

---

## 10. Componentes shadcn utilizados

Todos los siguientes componentes están instalados en `src/components/ui/`:

- **Formularios:** `button`, `input`, `label`, `form`, `select`
- **Layout:** `card`, `separator`, `sidebar`
- **Feedback:** `badge`, `skeleton`, `sonner`
- **Overlays:** `dialog`, `sheet`, `dropdown-menu`
- **Datos:** `table`, `avatar`

---

## 11. Convenciones del design system

El sistema define las siguientes reglas para mantener consistencia visual:

### Superficies y color
- `bg-muted` para secciones y áreas de fondo; `bg-card` para cards elevadas.
- Los colores se expresan siempre con tokens CSS (`text-primary`, `bg-muted`, `text-foreground`). No se usan valores hex hardcodeados ni `text-black` / `text-white`.
- Las secciones se separan cambiando el `bg-*`, no con `border-b` / `border-t`.

### Tipografía
- `font-display` (Manrope) en todos los títulos `h1`–`h4`. Ya aplicado globalmente en `@layer base`.
- `font-sans` (Inter) es el default del body — no hace falta declararlo explícitamente.

### Sombras
- `shadow-card` en cards. `shadow-card-hover` al hacer hover (con `transition-shadow`).
- Las sombras nunca superan el 8% de opacidad.

### Bordes y radios
- `rounded-full` para badges y tags.
- `rounded-md` para cards, inputs y botones.

### Estados
- Siempre usar `StatusBadge` para representar estados — nunca texto de color sin componente contenedor.

### Infraestructura
- No crear `tailwind.config.ts` — con Tailwind v4 la configuración vive en el CSS.
- No instalar `tailwindcss-animate` — `tw-animate-css` ya está en el proyecto.