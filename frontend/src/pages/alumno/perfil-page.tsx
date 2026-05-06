import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService, type AlumnoProfile } from '@/services/alumno';
import { skillsService, type Skill } from '@/services/skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  const { token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AlumnoProfile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
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

      // Sync skills: compare form state vs original profile
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

  const allSkillNames = availableSkills.map((s) => s.nombre);
  const selectedSkillNames = form.watch('skills');

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <UserCircle className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            {isOnboarding ? 'Completá tu perfil' : 'Editar perfil'}
          </h1>
          {isOnboarding && (
            <p className="text-sm text-muted-foreground">
              Necesitamos un poco más de información para recomendarte proyectos
            </p>
          )}
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Personal data — only in edit mode */}
              {!isOnboarding && (
                <>
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
                </>
              )}

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sobre vos
                      {isOnboarding && (
                        <span className="text-destructive ml-1">*</span>
                      )}
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

              {/* CV URL */}
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

              {/* Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Habilidades
                      {isOnboarding && (
                        <span className="text-destructive ml-1">*</span>
                      )}
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

                    {/* Custom skill */}
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
                {!isOnboarding && (
                  <Button
                    className="h-12 px-4"
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/alumno/dashboard')}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  className="h-12 px-4"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isOnboarding ? (
                    'Guardar y continuar'
                  ) : (
                    'Guardar cambios'
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
