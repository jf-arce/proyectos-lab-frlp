import { type RefObject } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PerfilSkillsField } from './perfil-skills-field';
import { type PerfilFormValues } from '@/hooks/use-perfil-alumno';

interface PerfilOnboardingFormProps {
  form: UseFormReturn<PerfilFormValues>;
  allSkillNames: string[];
  selectedSkillNames: string[];
  skillAnchor: RefObject<HTMLDivElement | null>;
  newSkillInput: string;
  onSkillsChange: (names: string[]) => void;
  onNewSkillInputChange: (value: string) => void;
  onAddCustomSkill: () => void;
  onSubmit: (values: PerfilFormValues) => Promise<void>;
}

export function PerfilOnboardingForm({
  form,
  allSkillNames,
  selectedSkillNames,
  skillAnchor,
  newSkillInput,
  onSkillsChange,
  onNewSkillInputChange,
  onAddCustomSkill,
  onSubmit,
}: PerfilOnboardingFormProps) {
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      <PerfilSkillsField
                        allSkillNames={allSkillNames}
                        selectedSkillNames={selectedSkillNames}
                        skillAnchor={skillAnchor}
                        onValueChange={onSkillsChange}
                        newSkillInput={newSkillInput}
                        onNewSkillInputChange={onNewSkillInputChange}
                        onAddCustomSkill={onAddCustomSkill}
                      />
                    </FormControl>
                    <FormMessage />
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
