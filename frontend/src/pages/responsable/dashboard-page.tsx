import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { proyectosService, type Proyecto } from '@/services/proyectos';

export function ResponsableDashboardPage() {
  const { token } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      proyectosService
        .getMyProjects(token)
        .then(setProyectos)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Cargando tablero...</div>;
  }

  const activos = proyectos.filter((p) => p.estado === 'ACTIVO').length;
  // A pending application might not be directly calculable unless the backend returns them explicitly filtered,
  // but if all applications for the project are returned, we filter by pending.
  const nuevasPostulaciones = proyectos.reduce(
    (acc, proj) =>
      acc + (proj.postulaciones?.filter((pos) => pos.estado === 'PENDIENTE').length || 0),
    0
  );

  return (
    <>
      {/* Header Section */}
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">
            Panel General
          </h2>
          <p className="mt-1 text-muted-foreground">
            Gestión de proyectos y convocatorias vigentes.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-muted px-5 py-2.5 font-medium text-foreground transition-all hover:brightness-105 active:scale-95">
            <span className="material-symbols-outlined text-lg">download</span>
            Reporte
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:brightness-105 active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Proyecto
          </button>
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Metric Card 1 */}
        <div className="flex justify-between flex-col h-40 rounded-xl bg-card p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            {/* Si quisieras mostrar porcentaje de subida, se deja harcodeado momentaneamente */}
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
              +15% vs mes ant.
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-primary">{nuevasPostulaciones}</p>
            <p className="text-sm font-medium text-muted-foreground">
              Postulaciones nuevas
            </p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="flex justify-between flex-col h-40 rounded-xl bg-card p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-primary">{activos}</p>
            <p className="text-sm font-medium text-muted-foreground">
              Proyectos activos
            </p>
          </div>
        </div>

        {/* Descriptive Image Card */}
        <div className="group relative h-40 overflow-hidden rounded-xl">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <img
            alt="Laboratory atmosphere"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVvzpz3-dIdcr5kl5nhL78d_VR0pR6GAfHhi50nMW_k166mhA7PzzTQHymc_i39D0wpNvlttN2zLS7VGq2ToYuZqeCodY5b7QBdxqYgY-3JNBkpEOJU0_nlafLwrKLsAT2XiTqbXn-K0gVFd4UMzTym2HI_6T5qo-JY-kidHT-lzx64YqJZOLnoPpSCp4WBGruNY6izuDOvDVl_YVF5gEzsnbug2Iiw5cDD_oqJciPOJ2RyDxQjoqvcXjI3UP6St1gsBy7RqMDQw1o"
          />
          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-lg font-bold text-white">UTN FRLP</p>
            <p className="text-xs text-blue-100/80">Excelencia en Investigación</p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="overflow-hidden rounded-xl bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/50 px-8 py-6">
          <h3 className="text-xl font-bold text-primary">Mis Proyectos</h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              className="w-64 rounded-lg border-none bg-muted py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="Buscar proyecto..."
              type="text"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Título del Proyecto
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Postulantes
                </th>
                <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {proyectos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-8 text-center text-muted-foreground">No hay proyectos para mostrar.</td>
                </tr>
              ) : (
                proyectos.map((proyecto) => {
                  const isClosed = proyecto.estado !== 'ACTIVO';
                  const postCount = proyecto.postulaciones?.length || 0;
                  const firstLetters = proyecto.postulaciones?.slice(0, 3).map(
                    (p) => `${p.alumno?.nombre?.charAt(0) || ''}${p.alumno?.apellido?.charAt(0) || ''}`
                  ) || [];

                  return (
                    <tr
                      key={proyecto.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-8 py-5">
                        <div
                          className={`font-semibold ${
                            isClosed ? 'text-foreground/60 italic' : 'text-foreground'
                          }`}
                        >
                          {proyecto.titulo}
                        </div>
                        <div
                          className={`text-xs ${
                            isClosed ? 'text-muted-foreground/60' : 'text-muted-foreground'
                          }`}
                        >
                          Creado el {new Date(proyecto.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {isClosed ? (
                          <span className="text-sm font-medium text-muted-foreground/60">
                            {postCount} Postulantes asignados
                          </span>
                        ) : (
                          <div className="flex -space-x-2">
                            {firstLetters.map((l, i) => (
                              <div
                                key={i}
                                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-[10px] font-bold"
                              >
                                {l}
                              </div>
                            ))}
                            {postCount > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
                                +{postCount - 3}
                              </div>
                            )}
                            {postCount === 0 && (
                              <span className="text-sm text-muted-foreground">0</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            !isClosed
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {proyecto.estado === 'ACTIVO' ? 'Abierto' : 'Cerrado'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className={`rounded-lg p-2 transition-colors ${
                              isClosed
                                ? 'cursor-not-allowed text-muted-foreground/40'
                                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                            }`}
                            title="Ver Postulantes"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button
                            className={`rounded-lg p-2 transition-colors ${
                              isClosed
                                ? 'cursor-not-allowed text-muted-foreground/40'
                                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                            }`}
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          {!isClosed ? (
                            <button
                              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Cerrar"
                            >
                              <span className="material-symbols-outlined">block</span>
                            </button>
                          ) : (
                            <button
                              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                              title="Reabrir / Historial"
                            >
                              <span className="material-symbols-outlined">history</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination-like footer */}
        {proyectos.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 px-8 py-4">
            <p className="text-xs font-medium text-muted-foreground">
              Mostrando {proyectos.length} proyectos
            </p>
            <div className="flex gap-2">
              <button
                className="rounded p-1 transition-colors hover:bg-muted disabled:opacity-30"
                disabled
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>
              <button className="rounded p-1 transition-colors hover:bg-muted disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* FAB for quick action */}
      <button className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card transition-all hover:scale-110 active:scale-95">
        <span className="material-symbols-outlined">add</span>
      </button>
    </>
  );
}
