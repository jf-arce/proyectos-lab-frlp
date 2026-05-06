import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  UserCircle,
  Pencil,
  Star,
  User,
  Mail,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService, type AlumnoProfile } from '@/services/alumno';
import { skillsService, type Skill } from '@/services/skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  useComboboxAnchor,
} from '@/components/ui/combobox';

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  legajo: z.string().min(1, 'El legajo es obligatorio'),
  anioEnCurso: z.string().min(1, 'Seleccioná un año'),
  bio: z.string().min(20, 'La bio debe tener al menos 20 caracteres'),
  cvUrl: z.string().url('Ingresá una URL válida').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Agregá al menos una habilidad'),
});

type FormValues = z.infer<typeof schema>;

export function PerfilPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AlumnoProfile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const skillAnchor = useComboboxAnchor();

  const isOnboarding = profile !== null && !profile.isProfileComplete;

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      legajo: '',
      anioEnCurso: '',
      bio: '',
      cvUrl: '',
      skills: [],
    },
  });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      alumnoService.getMyProfile(token),
      skillsService.findAll(token),
    ])
      .then(([p, skills]) => {
        setProfile(p);
        setAvailableSkills(skills);
        form.reset({
          nombre: p.nombre,
          apellido: p.apellido,
          legajo: p.legajo,
          anioEnCurso: String(p.anioEnCurso),
          bio: p.bio ?? '',
          cvUrl: p.cvUrl ?? '',
          skills: p.skills.map((s) => s.nombre),
        });
      })
      .catch(() => toast.error('Error al cargar el perfil'))
      .finally(() => setLoadingProfile(false));
  }, [token, form]);

  async function onSubmit(values: FormValues) {
    if (!token) return;
    try {
      await alumnoService.updateMyProfile(
        isOnboarding
          ? { bio: values.bio, cvUrl: values.cvUrl || null }
          : {
              nombre: values.nombre,
              apellido: values.apellido,
              legajo: values.legajo,
              anioEnCurso: Number(values.anioEnCurso),
              bio: values.bio,
              cvUrl: values.cvUrl || null,
            },
        token,
      );

      const originalNames = profile?.skills.map((s) => s.nombre) ?? [];
      const toAdd = values.skills.filter((n) => !originalNames.includes(n));
      const toRemove = originalNames.filter((n) => !values.skills.includes(n));

      for (const name of toAdd) {
        const existing = availableSkills.find((s) => s.nombre === name);
        if (existing)
          await alumnoService.addSkill({ skillId: existing.id }, token);
        else await alumnoService.addSkill({ nombre: name }, token);
      }
      for (const name of toRemove) {
        const existing = profile?.skills.find((s) => s.nombre === name);
        if (existing) await alumnoService.removeSkill(existing.id, token);
      }

      toast.success('Perfil actualizado');

      if (isOnboarding) {
        navigate('/alumno/dashboard', { replace: true });
      } else {
        const updated = await alumnoService.getMyProfile(token);
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  }

  function handleSkillsChange(newNames: string[]) {
    form.setValue('skills', newNames, { shouldValidate: true });
  }

  function handleAddCustomSkill() {
    const name = newSkillInput.trim();
    if (!name) return;
    const current = form.getValues('skills');
    if (!current.includes(name)) {
      form.setValue('skills', [...current, name], { shouldValidate: true });
    }
    setNewSkillInput('');
  }

  function handleStartEdit() {
    if (!profile) return;
    form.reset({
      nombre: profile.nombre,
      apellido: profile.apellido,
      legajo: profile.legajo,
      anioEnCurso: String(profile.anioEnCurso),
      bio: profile.bio ?? '',
      cvUrl: profile.cvUrl ?? '',
      skills: profile.skills.map((s) => s.nombre),
    });
    setIsEditing(true);
  }

  const allSkillNames = availableSkills.map((s) => s.nombre);
  const selectedSkillNames = useWatch({
    control: form.control,
    name: 'skills',
  });

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Onboarding mode: show form directly (no dialog)
  if (isOnboarding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <UserCircle className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              Completá tu perfil
            </h1>
            <p className="text-sm text-muted-foreground">
              Necesitamos un poco más de información para recomendarte proyectos
            </p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sobre vos
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contá brevemente tus intereses, objetivos y áreas de estudio..."
                          className="resize-none min-h-28"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de tu CV</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Habilidades
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          items={allSkillNames}
                          multiple
                          value={selectedSkillNames}
                          onValueChange={handleSkillsChange}
                        >
                          <div ref={skillAnchor}>
                            <ComboboxChips className="min-h-10">
                              {selectedSkillNames.map((name) => (
                                <ComboboxChip key={name}>{name}</ComboboxChip>
                              ))}
                              <ComboboxChipsInput
                                placeholder={
                                  selectedSkillNames.length === 0
                                    ? 'Buscar habilidad...'
                                    : ''
                                }
                              />
                            </ComboboxChips>
                          </div>
                          <ComboboxContent anchor={skillAnchor}>
                            <ComboboxEmpty>
                              No hay habilidades que coincidan
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(name: string) => (
                                <ComboboxItem key={name} value={name}>
                                  {name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </FormControl>
                      <FormMessage />
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Agregar habilidad personalizada..."
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSkill();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={!newSkillInput.trim()}
                          onClick={handleAddCustomSkill}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    className="h-12 px-4"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      'Guardar y continuar'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const initials =
    `${profile.nombre?.[0] ?? ''}${profile.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <>
      <div className="space-y-5">
        {/* Profile Header Section */}
        <section>
          <div className="bg-card p-8 rounded-xl flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden border border-border">
            <div className="relative z-10 w-25 h-25 md:w-40 md:h-40 shrink-0">
              <Avatar className="w-full h-full">
                <AvatarFallback className="text-3xl md:text-4xl bg-secondary text-primary font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="relative z-10 grow">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-primary mb-1">
                    {profile.nombre} {profile.apellido}
                  </h1>
                  <p className="text-muted-foreground font-medium text-lg">
                    Estudiante de Ingeniería
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 shrink-0 mt-4 md:mt-0"
                  onClick={handleStartEdit}
                >
                  <Pencil className="size-4" />
                  Editar perfil
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Legajo
                  </p>
                  <p className="text-foreground font-bold text-lg">
                    {profile.legajo}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Año
                  </p>
                  <p className="text-foreground font-bold text-lg">
                    {profile.anioEnCurso}° Nivel
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Estado
                  </p>
                  <p className="text-primary font-bold text-lg">Regular</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          </div>
        </section>

        {/* Two Column Layout — bio left, skills right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Bio + CV */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Biografía Profesional
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  {profile.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="italic text-muted-foreground/60">
                      Aún no has cargado una biografía profesional.
                    </p>
                  )}
                </div>

                {/* CV Section */}
                <div className="mt-12 bg-muted/30 p-8 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-border/50">
                  <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center rounded-xl">
                    <FileText className="size-8" />
                  </div>
                  <div className="grow text-center md:text-left">
                    <h4 className="text-lg font-bold text-primary">
                      Curriculum Vitae
                    </h4>
                    {profile.cvUrl ? (
                      <p className="text-muted-foreground text-sm">
                        Enlace externo disponible
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Sin CV cargado
                      </p>
                    )}
                  </div>
                  {profile.cvUrl && (
                    <Button className="gap-2 shrink-0" asChild>
                      <a
                        href={profile.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        Ver CV
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Skills + Contact */}
          <aside className="lg:col-span-4 space-y-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                    <Star className="size-4" />
                    Habilidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="secondary"
                          className="px-3 py-1 text-sm font-semibold"
                        >
                          {skill.nombre}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Sin habilidades registradas
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                    <User className="size-4" />
                    Contacto
                  </h2>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {profile.usuario?.email ?? user?.email}
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={(open: boolean) => !open && setIsEditing(false)}
      >
        <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="legajo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legajo</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anioEnCurso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año en curso</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccioná un año" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {[1, 2, 3, 4, 5].map((y) => (
                              <SelectItem key={y} value={y.toString()}>
                                {y}° año
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobre vos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contá brevemente tus intereses, objetivos y áreas de estudio..."
                        className="resize-none min-h-28"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de tu CV</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Habilidades</FormLabel>
                    <FormControl>
                      <Combobox
                        items={allSkillNames}
                        multiple
                        value={selectedSkillNames}
                        onValueChange={handleSkillsChange}
                      >
                        <div ref={skillAnchor}>
                          <ComboboxChips className="min-h-10">
                            {selectedSkillNames.map((name) => (
                              <ComboboxChip key={name}>{name}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                              placeholder={
                                selectedSkillNames.length === 0
                                  ? 'Buscar habilidad...'
                                  : ''
                              }
                            />
                          </ComboboxChips>
                        </div>
                        <ComboboxContent anchor={skillAnchor}>
                          <ComboboxEmpty>
                            No hay habilidades que coincidan
                          </ComboboxEmpty>
                          <ComboboxList>
                            {(name: string) => (
                              <ComboboxItem key={name} value={name}>
                                {name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </FormControl>
                    <FormMessage />
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Agregar habilidad personalizada..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        disabled={!newSkillInput.trim()}
                        onClick={handleAddCustomSkill}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  className="h-10 px-4"
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="h-10 px-4"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
