import { type RefObject } from 'react';
import { Loader2 } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { PerfilSkillsField } from './perfil-skills-field';
import { type PerfilFormValues } from '@/hooks/use-perfil-alumno';

interface PerfilEditDialogProps {
  isEditing: boolean;
  onOpenChange: (open: boolean) => void;
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

export function PerfilEditDialog({
  isEditing,
  onOpenChange,
  form,
  allSkillNames,
  selectedSkillNames,
  skillAnchor,
  newSkillInput,
  onSkillsChange,
  onNewSkillInputChange,
  onAddCustomSkill,
  onSubmit,
}: PerfilEditDialogProps) {
  return (
    <Dialog open={isEditing} onOpenChange={onOpenChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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

            <div className="flex justify-end gap-3 pt-2">
              <Button
                className="h-10 px-4"
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
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
  );
}
