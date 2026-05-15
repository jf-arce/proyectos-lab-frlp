import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Mail, 
  ArrowLeft,
  Building2,
  Save,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { responsableService, type ResponsableProfile } from '@/services/responsable';
import { toast } from 'sonner';

export function ResponsableProfilePage() {
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ResponsableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const data = await responsableService.getProfile(token);
        setProfile(data);
        setNombre(data.nombre);
        setApellido(data.apellido);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setSaving(true);
    try {
      await responsableService.updateProfile({ nombre, apellido }, token);
      toast.success('Perfil actualizado correctamente');
      // Refresh local profile state
      if (profile) {
        setProfile({ ...profile, nombre, apellido });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initials = profile ? `${profile.nombre[0]}${profile.apellido[0]}`.toUpperCase() : '??';

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="size-4" />
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Avatar */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="shadow-smooth border-none bg-card overflow-hidden">
            <div className="h-24 bg-primary/10 w-full" />
            <CardContent className="p-6 -mt-12 text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-lg rounded-2xl">
                <AvatarFallback className="text-2xl bg-secondary text-primary font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-black text-primary mt-4">
                {nombre} {apellido}
              </h2>
              <p className="text-muted-foreground font-medium text-sm">
                Responsable de Laboratorio
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <div className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/10">
                  UTN FRLP
                </div>
                <div className="bg-secondary/50 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-border">
                  STAFF
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-smooth border-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Laboratorio</p>
                  <p className="font-bold text-foreground leading-none">{profile?.laboratorio.nombre}</p>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Correo Electrónico</p>
                  <p className="font-bold text-foreground leading-none">{authUser?.email}</p>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Rol del Sistema</p>
                  <p className="font-bold text-foreground leading-none">Administrador de Lab</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-8">
          <Card className="shadow-smooth border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-black text-primary">Información Personal</CardTitle>
              <CardDescription className="font-medium">
                Actualizá tus datos básicos de perfil que verán otros miembros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Nombre
                    </Label>
                    <Input 
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Apellido
                    </Label>
                    <Input 
                      id="apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="h-12 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                    <Info className="size-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-amber-900 dark:text-amber-300">Nota sobre el laboratorio</p>
                    <p className="text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                      La vinculación con el laboratorio <strong>{profile?.laboratorio.nombre}</strong> no puede ser modificada directamente. 
                      Para cambiar de laboratorio, contactá con el administrador del sistema.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="h-12 px-8 font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                    {!saving && <Save className="size-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reuse the Info icon from lucide-react if not imported
function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
