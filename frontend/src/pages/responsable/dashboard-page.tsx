import { useEffect, useState } from 'react';
import {
  Plus,
  UserPlus,
  Rocket,
  Search,
  Eye,
  Pencil,
  Ban,
  History,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  proyectosService,
  type Proyecto,
  type Postulacion,
} from '@/services/proyectos';
import { skillsService, type Skill } from '@/services/skills';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function ResponsableDashboardPage() {
  const { token } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [isViewApplicantsOpen, setIsViewApplicantsOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [applicants, setApplicants] = useState<Postulacion[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCupos, setEditCupos] = useState(0);
  const [editDuracion, setEditDuracion] = useState('');
  const [editFechaCierre, setEditFechaCierre] = useState('');
  const [editSkillIds, setEditSkillIds] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  const fetchProyectos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await proyectosService.getMyProjects(token);
      setProyectos(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
    const fetchSkills = async () => {
      if (!token) return;
      try {
        const data = await skillsService.findAll(token);
        setAvailableSkills(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast.error('No se pudieron cargar las habilidades');
      }
    };
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleToggleStatus = async (proyecto: Proyecto) => {
    if (!token) return;
    const nuevoEstado = proyecto.estado === 'ACTIVO' ? 'CERRADO' : 'ACTIVO';
    try {
      await proyectosService.updateProjectStatus(
        proyecto.id,
        nuevoEstado,
        token,
      );
      toast.success(
        nuevoEstado === 'ACTIVO' ? 'Proyecto reabierto' : 'Proyecto cerrado',
      );
      fetchProyectos();
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleOpenApplicants = async (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setIsViewApplicantsOpen(true);
    if (!token) return;
    try {
      setLoadingApplicants(true);
      const data = await proyectosService.getProjectApplications(
        proyecto.id,
        token,
      );
      setApplicants(data);
    } catch {
      toast.error('Error al cargar postulantes');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplication = async (
    applicationId: string,
    status: 'ACEPTADO' | 'RECHAZADO',
  ) => {
    if (!token || !selectedProject) return;
    try {
      await proyectosService.updateApplicationStatus(
        applicationId,
        status,
        token,
      );
      toast.success(`Postulación ${status.toLowerCase()}`);
      // Refresh applicants
      const data = await proyectosService.getProjectApplications(
        selectedProject.id,
        token,
      );
      setApplicants(data);
      // Refresh main proyectos
      fetchProyectos();
    } catch {
      toast.error('Error al procesar postulación');
    }
  };

  const handleOpenEdit = (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setEditTitle(proyecto.titulo);
    setEditDescription(proyecto.descripcion);
    setEditCupos(proyecto.cupos);
    setEditDuracion(proyecto.duracion || '');
    setEditFechaCierre(
      proyecto.fechaCierre ? proyecto.fechaCierre.split('T')[0] : '',
    );
    // In a real app, skills would come from the project.
    // Assuming Proyecto interface is updated to include skill ids or we just use an empty array for now.
    // If backend returns skills, we map them.
    setEditSkillIds(proyecto.skills?.map((s) => s.id) || []);
    setIsEditProjectOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!token || !selectedProject) return;
    try {
      await proyectosService.updateProject(
        selectedProject.id,
        {
          titulo: editTitle,
          descripcion: editDescription,
          cupos: editCupos,
          duracion: editDuracion,
          fechaCierre: editFechaCierre,
          skillIds: editSkillIds,
        },
        token,
      );
      toast.success('Proyecto actualizado');
      setIsEditProjectOpen(false);
      fetchProyectos();
    } catch {
      toast.error('Error al actualizar el proyecto');
    }
  };

  const proyectosActivos = proyectos.filter(
    (p) => p.estado === 'ACTIVO',
  ).length;
  const nuevasPostulaciones = proyectos.reduce(
    (acc, p) =>
      acc +
      (p.postulaciones?.filter((post) => post.estado === 'PENDIENTE').length ||
        0),
    0,
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse font-medium">
          Cargando tablero...
        </div>
      </div>
    );
  }

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
          <Link to="/responsable/proyectos/nuevo">
            <Button className="gap-2 shadow-md h-12 px-4 font-semibold">
              <Plus className="size-5" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Metric Card 1 */}
        <Card className="shadow-smooth border-none bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <UserPlus className="size-5" />
            </div>
            <Badge
              variant="secondary"
              className="gap-1 font-bold text-[10px] py-0.5"
            >
              <TrendingUp className="size-3" /> +15%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tight">
              {nuevasPostulaciones}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Postulaciones nuevas
            </p>
          </CardContent>
        </Card>

        {/* Metric Card 2 */}
        <Card className="shadow-smooth border-none bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Rocket className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tight">
              {proyectosActivos}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Proyectos activos
            </p>
          </CardContent>
        </Card>

        {/* Descriptive Image Card */}
        <div className="group relative h-40 overflow-hidden rounded-xl shadow-smooth ring-1 ring-border/10">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-primary/80 to-transparent"></div>
          <img
            alt="Laboratory atmosphere"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVvzpz3-dIdcr5kl5nhL78d_VR0pR6GAfHhi50nMW_k166mhA7PzzTQHymc_i39D0wpNvlttN2zLS7VGq2ToYuZqeCodY5b7QBdxqYgY-3JNBkpEOJU0_nlafLwrKLsAT2XiTqbXn-K0gVFd4UMzTym2HI_6T5qo-JY-kidHT-lzx64YqJZOLnoPpSCp4WBGruNY6izuDOvDVl_YVF5gEzsnbug2Iiw5cDD_oqJciPOJ2RyDxQjoqvcXjI3UP6St1gsBy7RqMDQw1o"
          />
          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-lg font-bold text-white leading-tight">
              UTN FRLP
            </p>
            <p className="text-xs text-blue-100/80 font-medium">
              Excelencia en Investigación
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="overflow-hidden rounded-xl bg-card border border-border/40 shadow-smooth">
        <div className="flex items-center justify-between border-b border-border/40 px-8 py-6 bg-muted/5">
          <h3 className="text-xl font-bold text-primary tracking-tight">
            Mis Proyectos
          </h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
              placeholder="Buscar proyecto..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Título del Proyecto
                </th>
                <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Postulantes
                </th>
                <th className="px-8 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Estado
                </th>
                <th className="px-8 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {proyectos.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-muted-foreground italic"
                  >
                    No hay proyectos para mostrar.
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto) => {
                  const isClosed = proyecto.estado !== 'ACTIVO';
                  const postCount = proyecto.postulaciones?.length || 0;
                  const firstLetters =
                    proyecto.postulaciones
                      ?.slice(0, 3)
                      .map(
                        (p) =>
                          `${p.alumno?.nombre?.charAt(0) || ''}${p.alumno?.apellido?.charAt(0) || ''}`,
                      ) || [];

                  return (
                    <tr
                      key={proyecto.id}
                      className="transition-colors hover:bg-muted/10 group/row"
                    >
                      <td className="px-8 py-5">
                        <div
                          className={cn(
                            'font-bold text-sm tracking-tight',
                            isClosed
                              ? 'text-foreground/40 italic line-through decoration-muted-foreground/30'
                              : 'text-foreground',
                          )}
                        >
                          {proyecto.titulo}
                        </div>
                        <div
                          className={cn(
                            'text-[11px] font-medium mt-0.5',
                            isClosed
                              ? 'text-muted-foreground/40'
                              : 'text-muted-foreground/70',
                          )}
                        >
                          Creado el{' '}
                          {new Date(proyecto.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {isClosed ? (
                          <span className="text-xs font-semibold text-muted-foreground/40 bg-muted/40 px-2 py-0.5 rounded">
                            {postCount} Postulantes asignados
                          </span>
                        ) : (
                          <div className="flex -space-x-2">
                            {firstLetters.map((l, i) => (
                              <Avatar
                                key={i}
                                className="size-8 border-2 border-background ring-1 ring-border/10"
                              >
                                <AvatarFallback className="bg-primary/10 text-[10px] font-black text-primary">
                                  {l}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {postCount > 3 && (
                              <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-black text-muted-foreground ring-1 ring-border/10">
                                +{postCount - 3}
                              </div>
                            )}
                            {postCount === 0 && (
                              <span className="text-xs font-bold text-muted-foreground/50">
                                —
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <Badge
                          variant={!isClosed ? 'default' : 'secondary'}
                          className={cn(
                            'px-3 py-0.5 text-[10px] uppercase tracking-tighter font-extrabold shadow-sm',
                            !isClosed
                              ? 'bg-primary/90 hover:bg-primary'
                              : 'opacity-60',
                          )}
                        >
                          {proyecto.estado === 'ACTIVO' ? 'Abierto' : 'Cerrado'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={isClosed}
                            title="Ver Postulantes"
                            onClick={() => handleOpenApplicants(proyecto)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={isClosed}
                            title="Editar"
                            onClick={() => handleOpenEdit(proyecto)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {!isClosed ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Cerrar"
                              onClick={() => handleToggleStatus(proyecto)}
                            >
                              <Ban className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-primary/10"
                              title="Reabrir / Historial"
                              onClick={() => handleToggleStatus(proyecto)}
                            >
                              <History className="size-4" />
                            </Button>
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
          <div className="flex items-center justify-between border-t border-border/30 bg-muted/10 px-8 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {proyectos.length} proyectos totales
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="size-8" disabled>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* View Applicants Dialog */}
      <Dialog
        open={isViewApplicantsOpen}
        onOpenChange={setIsViewApplicantsOpen}
      >
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold pr-12 leading-tight">
              Postulantes: {selectedProject?.titulo}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Lista de alumnos interesados en participar en este proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
            {loadingApplicants ? (
              <div className="text-center py-12 text-muted-foreground animate-pulse flex flex-col items-center gap-3">
                <Search className="size-8 opacity-20" />
                <span>Cargando postulantes...</span>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-3">
                <UserPlus className="size-8 opacity-20" />
                <p className="font-medium">
                  No hay postulaciones registradas aún.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pr-1">
                {applicants.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 transition-colors shadow-sm gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-11 border-2 border-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {post.alumno.nombre[0]}
                          {post.alumno.apellido[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-sm text-foreground">
                            {post.alumno.nombre} {post.alumno.apellido}
                          </p>
                          <Link
                            to={`/responsable/alumnos/${post.alumno.id}`}
                            className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter transition-colors"
                          >
                            Ver Perfil
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] uppercase font-black px-1.5 h-4 tracking-tighter',
                              post.estado === 'ACEPTADO'
                                ? 'text-green-600 border-green-200 bg-green-50'
                                : post.estado === 'RECHAZADO'
                                  ? 'text-red-600 border-red-200 bg-red-50'
                                  : 'text-amber-600 border-amber-200 bg-amber-50',
                            )}
                          >
                            {post.estado}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            Postulado hace poco
                          </span>
                        </div>
                      </div>
                    </div>
                    {post.estado === 'PENDIENTE' && (
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-4 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          onClick={() =>
                            handleUpdateApplication(post.id, 'RECHAZADO')
                          }
                        >
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 px-5 text-xs font-bold rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                          onClick={() =>
                            handleUpdateApplication(post.id, 'ACEPTADO')
                          }
                        >
                          Aceptar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-none sm:max-w-none overflow-y-auto custom-scrollbar p-16">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary">
              Editar Proyecto
            </DialogTitle>
            <DialogDescription className="font-medium">
              Modificá todos los parámetros de la convocatoria de investigación.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Título del Proyecto
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título del proyecto"
                  className="bg-muted/30 border-none h-11 px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Descripción detallada
                </label>
                <Textarea
                  className="min-h-45 bg-muted/30 border-none p-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Breve descripción de los objetivos..."
                />
              </div>
            </div>

            {/* Right Column: Logistics & Skills */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Cupos
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={editCupos}
                      onChange={(e) => setEditCupos(parseInt(e.target.value))}
                      className="bg-muted/30 border-none h-11 pl-4 pr-10 font-bold focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Duración
                  </label>
                  <select
                    value={editDuracion}
                    onChange={(e) => setEditDuracion(e.target.value)}
                    className="w-full h-11 bg-muted/30 border-none rounded-md px-4 font-bold text-sm focus:ring-1 focus:ring-primary/40 outline-none cursor-pointer"
                  >
                    <option>3 meses</option>
                    <option>6 meses</option>
                    <option>1 año</option>
                    <option>Indefinido</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Cierre de inscripciones
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={editFechaCierre}
                    onChange={(e) => setEditFechaCierre(e.target.value)}
                    className="bg-muted/30 border-none h-11 px-4 font-bold text-sm focus-visible:ring-1 focus-visible:ring-primary/40 scheme-light"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Habilidades Requeridas
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-muted/20 rounded-xl border border-border/20">
                  {availableSkills.map((skill) => {
                    const isSelected = editSkillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          setEditSkillIds((prev) =>
                            prev.includes(skill.id)
                              ? prev.filter((id) => id !== skill.id)
                              : [...prev, skill.id],
                          );
                        }}
                        className={cn(
                          'px-3 py-1 rounded-full text-[10px] font-bold transition-all border',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/40',
                        )}
                      >
                        {skill.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end border-t border-border/20 pt-6">
            <Button
              variant="ghost"
              className="h-12 px-6 rounded-xl font-bold"
              onClick={() => setIsEditProjectOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="h-12 px-10 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary"
              onClick={handleSaveEdit}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
