# Design System: Portal de Gestión de PS y Proyectos de Laboratorio

## 1. Visión de diseño

**"The Academic Curator"** — Una plataforma institucional sin ser burocrática. Precisa sin ser fría.

### Principios
- **Jerarquía por superficie, no por bordes.** Los bloques se distinguen con cambios de fondo, no líneas de 1px.
- **Espaciado generoso.** Más margen = más credibilidad institucional.
- **New York style:** compacto, denso, ideal para dashboards con datos.
- **Sombras ambientales.** Sutiles (opacidad < 8%, blur alto).

---

## 2. Cambios sobre el `index.css` existente

El proyecto ya tiene el setup correcto de Tailwind v4 + shadcn. **Solo hay que modificar tres partes del `index.css` actual:**

### 2.1 — Reemplazar la fuente (Geist → Manrope + Inter)

Desinstalar `@fontsource-variable/geist` y reemplazar la línea de import por:

```bash
npm uninstall @fontsource-variable/geist
npm install @fontsource-variable/manrope @fontsource/inter
```

En `index.css`, reemplazar:
```css
/* ❌ Sacar esto */
@import "@fontsource-variable/geist";
```
```css
/* ✅ Poner esto */
@import "@fontsource-variable/manrope";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
```

Y en el bloque `@theme inline`, reemplazar las líneas de fuente:
```css
/* ❌ Sacar esto */
--font-heading: var(--font-sans);
--font-sans: 'Geist Variable', sans-serif;
```
```css
/* ✅ Poner esto */
--font-sans:    'Inter', sans-serif;
--font-display: 'Manrope Variable', sans-serif;
```

En `@layer base`, agregar el heading:
```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  /* Agregar: */
  h1, h2, h3, h4 {
    font-family: var(--font-display);
  }
}
```

### 2.2 — Reemplazar los tokens de color en `:root`

Reemplazar el bloque `:root` completo con los colores institucionales del proyecto:

```css
:root {
    /* Superficies */
    --background:       oklch(0.98 0.003 247);   /* #f8f9fa — fondo de página */
    --foreground:       oklch(0.16 0.010 247);   /* #191c1d — texto principal */
    --card:             oklch(1 0 0);             /* #ffffff — cards elevadas */
    --card-foreground:  oklch(0.16 0.010 247);
    --popover:          oklch(1 0 0);
    --popover-foreground: oklch(0.16 0.010 247);

    /* Azul institucional UTN */
    --primary:          oklch(0.26 0.070 252);   /* #00244b */
    --primary-foreground: oklch(1 0 0);

    /* Secundario y neutros */
    --secondary:        oklch(0.94 0.004 247);   /* #ebedf0 */
    --secondary-foreground: oklch(0.26 0.070 252);
    --muted:            oklch(0.96 0.003 247);   /* #f3f4f5 */
    --muted-foreground: oklch(0.52 0.007 247);   /* #6b7280 */
    --accent:           oklch(0.94 0.004 247);
    --accent-foreground: oklch(0.26 0.070 252);

    /* Estados */
    --destructive:      oklch(0.577 0.245 27.325); /* mantener igual */

    /* Bordes */
    --border:           oklch(0.90 0.005 247);   /* sutil, sin contraste duro */
    --input:            oklch(0.90 0.005 247);
    --ring:             oklch(0.26 0.070 252);

    /* New York: radio más compacto que el default (0.625rem → 0.375rem) */
    --radius: 0.375rem;

    /* Charts — mantener igual */
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);

    /* Sidebar — mantener igual que el default generado por shadcn */
    --sidebar:                  oklch(0.985 0 0);
    --sidebar-foreground:       oklch(0.145 0 0);
    --sidebar-primary:          oklch(0.26 0.070 252); /* azul institucional */
    --sidebar-primary-foreground: oklch(1 0 0);
    --sidebar-accent:           oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border:           oklch(0.922 0 0);
    --sidebar-ring:             oklch(0.708 0 0);

    /* ── Tokens propios del proyecto (no existen en el default de shadcn) ── */
    --status-accepted-bg: oklch(0.94 0.07 145);
    --status-accepted-fg: oklch(0.32 0.10 145);
    --status-pending-bg:  oklch(0.96 0.07 85);
    --status-pending-fg:  oklch(0.38 0.10 60);
    --status-rejected-bg: oklch(0.95 0.05 27);
    --status-rejected-fg: oklch(0.40 0.15 27);
}
```

### 2.3 — Agregar tokens propios al bloque `@theme inline`

Al final del bloque `@theme inline` existente, agregar:

```css
@theme inline {
    /* ... todo lo que ya existe se mantiene ... */

    /* Fuentes (reemplazar las líneas de Geist) */
    --font-sans:    'Inter', sans-serif;
    --font-display: 'Manrope Variable', sans-serif;

    /* Sombras ambientales del proyecto */
    --shadow-card:       0 2px 32px 0 oklch(0.26 0.07 252 / 0.05);
    --shadow-card-hover: 0 4px 48px 0 oklch(0.26 0.07 252 / 0.08);
    --shadow-nav:        0 1px 24px 0 oklch(0.26 0.07 252 / 0.06);
}
```

### 2.5 — Bloque `.dark` (paleta oscura institucional)

Reemplazar el bloque `.dark` generado por shadcn con la versión institucional. Criterios de diseño:
- El fondo mantiene un **tinte azul UTN sutil** (`hue 252, chroma 0.015`) en lugar de negro neutro.
- `--primary` pasa de `oklch(0.26)` a `oklch(0.65)` — el azul `#00244b` es ilegible sobre oscuro.
- Los tokens `--status-*` se invierten: fondo oscuro saturado + texto claro.
- El sidebar es ligeramente más oscuro que la card para distinguirse sin borde.

```css
.dark {
    /* Superficies */
    --background:       oklch(0.13 0.015 252);
    --foreground:       oklch(0.95 0.005 247);
    --card:             oklch(0.18 0.012 252);
    --card-foreground:  oklch(0.95 0.005 247);
    --popover:          oklch(0.18 0.012 252);
    --popover-foreground: oklch(0.95 0.005 247);

    /* Azul institucional — versión clara para dark mode */
    --primary:          oklch(0.65 0.12 252);
    --primary-foreground: oklch(0.10 0.015 252);

    /* Secundario y neutros */
    --secondary:        oklch(0.22 0.012 252);
    --secondary-foreground: oklch(0.90 0.005 247);
    --muted:            oklch(0.20 0.010 252);
    --muted-foreground: oklch(0.60 0.008 247);
    --accent:           oklch(0.22 0.012 252);
    --accent-foreground: oklch(0.90 0.005 247);

    /* Estados */
    --destructive:      oklch(0.704 0.191 22.216);

    /* Bordes */
    --border:           oklch(1 0 0 / 8%);
    --input:            oklch(1 0 0 / 10%);
    --ring:             oklch(0.65 0.12 252);

    /* Charts — igual que light */
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);

    /* Sidebar */
    --sidebar:                  oklch(0.16 0.015 252);
    --sidebar-foreground:       oklch(0.90 0.005 247);
    --sidebar-primary:          oklch(0.65 0.12 252);
    --sidebar-primary-foreground: oklch(0.10 0.015 252);
    --sidebar-accent:           oklch(0.22 0.012 252);
    --sidebar-accent-foreground: oklch(0.90 0.005 247);
    --sidebar-border:           oklch(1 0 0 / 8%);
    --sidebar-ring:             oklch(0.65 0.12 252);

    /* Tokens de estado — invertidos: fondo oscuro, texto claro */
    --status-accepted-bg: oklch(0.25 0.08 145);
    --status-accepted-fg: oklch(0.82 0.12 145);
    --status-pending-bg:  oklch(0.27 0.08 85);
    --status-pending-fg:  oklch(0.85 0.10 85);
    --status-rejected-bg: oklch(0.25 0.06 27);
    --status-rejected-fg: oklch(0.82 0.12 27);
}
```

### 2.4 — Agregar clases de estado al final del archivo

```css
/* ── Fuera de cualquier @layer, al final del archivo ── */
.status-accepted {
    background-color: var(--status-accepted-bg);
    color:            var(--status-accepted-fg);
}
.status-pending {
    background-color: var(--status-pending-bg);
    color:            var(--status-pending-fg);
}
.status-rejected {
    background-color: var(--status-rejected-bg);
    color:            var(--status-rejected-fg);
}
```

---

## 3. Paleta de colores

| Token | OKLCH | Hex aprox. | Uso |
|---|---|---|---|
| `primary` | `oklch(0.26 0.07 252)` | `#00244b` | Acciones principales, nav activa, botones |
| `background` | `oklch(0.98 0.003 247)` | `#f8f9fa` | Fondo de página |
| `card` | `oklch(1 0 0)` | `#ffffff` | Cards elevadas |
| `muted` | `oklch(0.96 0.003 247)` | `#f3f4f5` | Fondos de sección, inputs |
| `muted-foreground` | `oklch(0.52 0.007 247)` | `#6b7280` | Texto secundario, placeholders |
| `border` | `oklch(0.90 0.005 247)` | `#dde1e7` | Bordes sutiles |
| `destructive` | (sin cambios) | `#dc2626` | Errores, rechazos |

---

## 4. Tipografía

- **Display / Titulares:** `Manrope Variable` — peso 600–800 → clase `font-display`
- **UI / Cuerpo:** `Inter` — peso 400–600 → clase `font-sans` (default)

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

## 5. Sistema de superficies (sin bordes divisores)

```
bg-background (#f8f9fa)     ← fondo de página
  └── bg-muted (#f3f4f5)    ← secciones internas, filtros, sidebars
        └── bg-card (#fff)  ← cards elevadas ("flotadas")
              └── bg-muted  ← áreas destacadas dentro de una card
```

```tsx
// ✅ Correcto — separación por superficie
<div className="bg-background min-h-screen">
  <section className="bg-muted/60 py-8">
    <Card className="bg-card shadow-card">
      <CardContent>
        <div className="bg-muted rounded-md p-4">contenido destacado</div>
      </CardContent>
    </Card>
  </section>
</div>

// ❌ Incorrecto — borde divisor de 1px
<div className="border-b border-border">...</div>
```

---

## 6. Componentes del proyecto

### StatusBadge — Estado de postulación / proyecto

Componente propio, no es un shadcn Badge. Usar las clases CSS `.status-*` definidas arriba.

```tsx
// src/components/ui/status-badge.tsx
import { cn } from "@/lib/utils";

type Status = "pending" | "accepted" | "rejected" | "active" | "closed";

const config: Record<Status, { label: string; className: string }> = {
  pending:  { label: "Pendiente",  className: "status-pending"  },
  accepted: { label: "Aceptado",   className: "status-accepted" },
  rejected: { label: "Rechazado",  className: "status-rejected" },
  active:   { label: "Activo",     className: "bg-primary/10 text-primary" },
  closed:   { label: "Cerrado",    className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      className
    )}>
      {label}
    </span>
  );
}
```

### SkillTag — Etiqueta de habilidad

```tsx
// src/components/ui/skill-tag.tsx
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkillTag({
  children, removable, onRemove, className,
}: {
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full",
      "bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium",
      className
    )}>
      {children}
      {removable && (
        <button onClick={onRemove} className="rounded-full hover:bg-primary/10 p-0.5">
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
```

### ProjectCard — Card de proyecto

```tsx
// npx shadcn@latest add card button
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkillTag } from "@/components/ui/skill-tag";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-base font-semibold leading-snug">
              {project.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {project.lab} · Publicado hace {project.daysAgo} días
            </CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.skills.map(s => <SkillTag key={s}>{s}</SkillTag>)}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{project.applicants} postulantes</span>
          <Button size="sm">Postularse</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Navbar

```tsx
// npx shadcn@latest add button dropdown-menu
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm shadow-nav">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">

        <div className="flex items-center gap-3">
          <div className="size-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold font-display">U</span>
          </div>
          <span className="font-display font-semibold text-sm hidden sm:block">Portal LINSI</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 text-sm font-medium">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-semibold">JP</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>Mi perfil</DropdownMenuItem>
              <DropdownMenuItem>Mis postulaciones</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}
```

### Sidebar (responsable de laboratorio)

> El proyecto ya tiene el componente `Sidebar` de shadcn instalado. Usarlo como base y personalizar los items de navegación con `NavLink` de React Router.

```tsx
// src/components/layout/app-sidebar.tsx
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderOpen, Users, Bell } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { to: "/lab/dashboard",      icon: LayoutDashboard, label: "Dashboard"      },
  { to: "/lab/proyectos",      icon: FolderOpen,       label: "Proyectos"      },
  { to: "/lab/postulaciones",  icon: Users,            label: "Postulaciones"  },
  { to: "/lab/notificaciones", icon: Bell,             label: "Notificaciones" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-display font-semibold text-sm">Portal LINSI</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ to, icon: Icon, label }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton asChild>
                <NavLink to={to} className={({ isActive }) => cn(
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}>
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
```

---

## 7. Layouts por rol

```tsx
// src/layouts/StudentLayout.tsx
export function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}

// src/layouts/LabLayout.tsx — usa SidebarProvider de shadcn
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function LabLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="px-6 py-8 max-w-4xl">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## 8. Formularios

Patrón estándar. Usar `react-hook-form` + shadcn Form para validaciones.

```tsx
// npx shadcn@latest add form input label
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

## 10. Componentes shadcn a instalar

```bash
npx shadcn@latest add button card badge input label form
npx shadcn@latest add table select dropdown-menu
npx shadcn@latest add dialog sheet separator
npx shadcn@latest add avatar skeleton sonner
npx shadcn@latest add sidebar   # para el layout del responsable de laboratorio
```

---

## 11. Do's and Don'ts

### ✅ Do
- Usar `bg-muted` para secciones y `bg-card` para cards elevadas.
- Usar `font-display` (Manrope) en todos los títulos `h1`–`h4`.
- Usar `shadow-card` en cards. Nunca sombras con opacidad > 8%.
- Usar `StatusBadge` para todos los estados — nunca texto de color sin etiqueta.
- Usar `rounded-full` para badges/tags, `rounded-md` para cards y botones.

### ❌ Don't
- No usar `border-b` / `border-t` para dividir secciones — usar cambio de `bg-*`.
- No hardcodear colores hex — siempre usar tokens (`text-primary`, `bg-muted`, etc.).
- No usar `text-black` ni `text-white` — usar `text-foreground` / `text-primary-foreground`.
- No crear `tailwind.config.ts` — con v4 todo va en el CSS.
- No instalar `tailwindcss-animate` — `tw-animate-css` ya está en el proyecto.

---

*Portal LINSI — UTN FRLP · React 18 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui New York*
