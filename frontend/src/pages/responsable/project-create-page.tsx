import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Info, 
  BrainCircuit, 
  Calendar, 
  Users, 
  Hourglass, 
  Plus,
  Save,
  Send,
  ChevronRight,
  FileText,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { proyectosService } from '@/services/proyectos';
import { skillsService, type Skill } from '@/services/skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProjectCreatePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Form State
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cupos, setCupos] = useState(2);
  const [duracion, setDuracion] = useState('1 año');
  const [fechaCierre, setFechaCierre] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  
  // Loaded Data
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Skills State
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await skillsService.findAll(token);
        setAvailableSkills(data);
      } catch (error) {
        toast.error('No se pudieron cargar las habilidades');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [token]);

  const toggleSkill = (id: string) => {
    setSelectedSkillIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim() || !token) return;

    try {
      setCreatingSkill(true);
      const newSkill = await skillsService.createSkill({ nombre: newSkillName.trim() }, token);
      
      // Añadir la nueva skill a la lista de disponibles si no está
      setAvailableSkills(prev => [...prev, newSkill]);
      
      // Seleccionarla automáticamente
      setSelectedSkillIds(prev => [...prev, newSkill.id]);
      
      // Limpiar y cerrar
      setNewSkillName('');
      setIsAddingSkill(false);
      toast.success(`Habilidad "${newSkill.nombre}" creada y añadida`);
    } catch (error) {
      toast.error('Error al crear la habilidad');
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!titulo.trim() || !descripcion.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      await proyectosService.createProject({
        titulo,
        descripcion,
        cupos,
        duracion,
        fechaCierre,
        skillIds: selectedSkillIds
      }, token);
      
      toast.success('Proyecto publicado exitosamente');
      navigate('/responsable/dashboard');
    } catch (error) {
      toast.error('Error al crear el proyecto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Proyectos</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">Nuevo Registro</span>
          </nav>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-primary leading-tight">
              Crear Proyecto de Investigación
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl font-medium">
              Complete los detalles técnicos y académicos para la apertura de una nueva convocatoria de investigación en su laboratorio.
            </p>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="size-24 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
            <FileText className="size-10 text-primary opacity-80" />
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Main Column */}
        <section className="lg:col-span-8 space-y-8">
          <form className="space-y-8" id="project-form" onSubmit={handleSubmit}>
            {/* Basic Information Card */}
            <div className="bg-card rounded-2xl p-8 shadow-smooth ring-1 ring-border/5">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Info className="size-5 text-primary" />
                </div>
                Información General
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="title">
                    Título del proyecto
                  </label>
                  <Input 
                    id="title"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Implementación de Redes Neuronales en Redes Eléctricas" 
                    className="h-12 bg-muted/30 border-none px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="description">
                    Descripción detallada
                  </label>
                  <Textarea 
                    id="description"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describa los objetivos, metodología y alcance del proyecto..." 
                    className="min-h-[200px] bg-muted/30 border-none p-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Technical Requirements Card */}
            <div className="bg-card rounded-2xl p-8 shadow-smooth ring-1 ring-border/5">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BrainCircuit className="size-5 text-primary" />
                </div>
                Requisitos y Habilidades
              </h3>
              
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground italic font-medium">
                  Seleccione las competencias clave requeridas para los postulantes.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {loading ? (
                    <div className="text-xs text-muted-foreground animate-pulse">Cargando habilidades...</div>
                  ) : (
                    availableSkills.map((skill) => {
                      const isSelected = selectedSkillIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm",
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary active:scale-95"
                              : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:bg-muted active:scale-95"
                          )}
                        >
                          {skill.nombre}
                        </button>
                      );
                    })
                  )}

                  {isAddingSkill ? (
                    <div className="flex items-center gap-2 bg-muted/30 p-1 pr-2 rounded-full border border-primary/30 animate-in fade-in zoom-in-95 duration-200">
                      <Input
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateSkill();
                          }
                          if (e.key === 'Escape') setIsAddingSkill(false);
                        }}
                        autoFocus
                        placeholder="Nombre de la skill..."
                        className="h-7 text-xs border-none bg-transparent focus-visible:ring-0 w-32"
                      />
                      <button 
                        type="button" 
                        onClick={handleCreateSkill}
                        disabled={creatingSkill || !newSkillName.trim()}
                        className="p-1 hover:bg-primary/10 rounded-full text-primary transition-colors disabled:opacity-50"
                      >
                        <Check className="size-3" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingSkill(false)}
                        className="p-1 hover:bg-destructive/10 rounded-full text-destructive transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingSkill(true)}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all active:scale-95"
                    >
                      <Plus className="size-3" />
                      Otra
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Sidebar Actions Column */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          {/* Logistics Card */}
          <div className="bg-muted/30 rounded-2xl p-6 shadow-sm border border-border/40 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Calendar className="size-4" />
              Logística y Plazos
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="slots">
                  Cupos Disponibles
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    id="slots"
                    value={cupos}
                    onChange={(e) => setCupos(parseInt(e.target.value))}
                    className="h-11 bg-card border-none rounded-xl pl-4 pr-10 font-bold focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
                  />
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="duration">
                  Duración estimada
                </label>
                <select 
                  id="duration"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="w-full h-11 bg-card border-none rounded-xl px-4 font-bold text-sm focus:ring-1 focus:ring-primary/20 shadow-sm outline-none appearance-none cursor-pointer"
                >
                  <option>3 meses</option>
                  <option>6 meses</option>
                  <option>1 año</option>
                  <option>Indefinido</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="deadline">
                  Cierre de inscripciones
                </label>
                <div className="relative">
                  <Input 
                    type="date" 
                    id="deadline"
                    value={fechaCierre}
                    onChange={(e) => setFechaCierre(e.target.value)}
                    className="h-11 bg-card border-none rounded-xl px-4 font-bold text-sm focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm [color-scheme:light]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-card rounded-2xl p-5 shadow-smooth ring-1 ring-border/10 border border-primary/5">
            <div className="flex flex-col gap-3">
              <Button 
                form="project-form"
                type="submit"
                disabled={submitting}
                className="h-14 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Send className="size-4" />
                {submitting ? 'Publicando...' : 'Publicar Proyecto'}
              </Button>
              
              <Button 
                variant="outline"
                type="button"
                className="h-12 bg-muted/10 text-muted-foreground font-bold rounded-xl border-dashed hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="size-4" />
                Guardar Borrador
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-4 px-2 leading-relaxed font-semibold uppercase tracking-tighter opacity-70">
              Al publicar, el proyecto será visible para todos los estudiantes en el portal de laboratorios.
            </p>
          </div>

          {/* Decorative Context Image */}
          <div className="hidden lg:block rounded-2xl overflow-hidden shadow-smooth relative h-44 group ring-1 ring-border/5">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 to-transparent"></div>
            <img 
              alt="Lab Context" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC_vBGN4c4TzmzmvqVK301YYTG5esTg5Oh7-o-uuOqyWerREiqY82OdP3zXGQ08HjOkUniss6TuoTphQ6MOoHDs85wmmTaiLYjMjpFb5ForvrER7ei3Dxb0k0wLHMca4V2hx4v7i6OI0ZO8RgpAm2TAmoYNxMIMtmSM4UzCi8gpCqURIdZunutK1P5Q9xeosQ_isQ4ExBPXu585j7Itm5MApu-_Bn4UhL83BCm4LA_wrMWb2RGrGnZHg3fZFccfQhYCUD1wVpgjVIE"
            />
            <div className="absolute inset-x-0 bottom-4 z-20 px-6 text-center">
              <p className="text-white text-xs font-bold leading-tight drop-shadow-sm uppercase tracking-wider">Impulsando el futuro de la ingeniería desde la UTN.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

