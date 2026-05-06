import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePerfilAlumno } from '@/hooks/use-perfil-alumno';
import { PerfilOnboardingForm } from './components/perfil-onboarding-form';
import { PerfilView } from './components/perfil-view';
import { PerfilEditDialog } from './components/perfil-edit-dialog';

export function PerfilPage() {
  const { user } = useAuth();
  const {
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
  } = usePerfilAlumno();

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <PerfilOnboardingForm
        form={form}
        allSkillNames={allSkillNames}
        selectedSkillNames={selectedSkillNames}
        skillAnchor={skillAnchor}
        newSkillInput={newSkillInput}
        onSkillsChange={handleSkillsChange}
        onNewSkillInputChange={setNewSkillInput}
        onAddCustomSkill={handleAddCustomSkill}
        onSubmit={onSubmit}
      />
    );
  }

  if (!profile) return null;

  return (
    <>
      <PerfilView
        profile={profile}
        userEmail={user?.email}
        onEdit={handleStartEdit}
      />
      <PerfilEditDialog
        isEditing={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
        form={form}
        allSkillNames={allSkillNames}
        selectedSkillNames={selectedSkillNames}
        skillAnchor={skillAnchor}
        newSkillInput={newSkillInput}
        onSkillsChange={handleSkillsChange}
        onNewSkillInputChange={setNewSkillInput}
        onAddCustomSkill={handleAddCustomSkill}
        onSubmit={onSubmit}
      />
    </>
  );
}
