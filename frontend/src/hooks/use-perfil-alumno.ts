import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService } from '@/services/alumno';
import { skillsService, type Skill } from '@/services/skills';
import { useComboboxAnchor } from '@/components/ui/combobox';
import { usePerfilContext } from '@/context/perfil-context';

export const perfilSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  legajo: z.string().min(1, 'El legajo es obligatorio'),
  anioEnCurso: z.string().min(1, 'Seleccioná un año'),
  bio: z.string().min(20, 'La bio debe tener al menos 20 caracteres'),
  cvUrl: z.url('Ingresá una URL válida').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Agregá al menos una habilidad'),
});

export type PerfilFormValues = z.infer<typeof perfilSchema>;

export function usePerfilAlumno() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { profile, loadingProfile, refreshProfile } = usePerfilContext();

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const skillAnchor = useComboboxAnchor();

  const isOnboarding = profile !== null && !profile.isProfileComplete;

  const form = useForm<PerfilFormValues>({
    resolver: standardSchemaResolver(perfilSchema),
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

  const selectedSkillNames = useWatch({
    control: form.control,
    name: 'skills',
  });
  const allSkillNames = availableSkills.map((s) => s.nombre);

  useEffect(() => {
    if (!token) return;
    skillsService
      .findAll(token)
      .then(setAvailableSkills)
      .catch(() => null);
  }, [token]);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function onSubmit(values: PerfilFormValues) {
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
        const skill = profile?.skills.find((s) => s.nombre === name);
        if (skill) await alumnoService.removeSkill(skill.id, token);
      }

      toast.success('Perfil actualizado');
      await refreshProfile();

      if (isOnboarding) {
        navigate('/alumno/dashboard', { replace: true });
      } else {
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

  return {
    profile,
    loadingProfile,
    isOnboarding,
    isEditing,
    setIsEditing,
    form,
    allSkillNames,
    selectedSkillNames,
    newSkillInput,
    setNewSkillInput,
    skillAnchor,
    onSubmit,
    handleSkillsChange,
    handleAddCustomSkill,
    handleStartEdit,
  };
}
