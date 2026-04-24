import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { authService } from '@/services/auth';
import { Role } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

interface AddResponsableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddResponsableDialog({ open, onOpenChange }: AddResponsableDialogProps) {
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user?.laboratorioId) {
      toast.error('No se pudo identificar el laboratorio');
      return;
    }

    try {
      await authService.register({
        ...values,
        rol: Role.RESPONSABLE_LABORATORIO,
        laboratorioId: user.laboratorioId,
      });
      toast.success('Nuevo responsable registrado correctamente.');
      form.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar al responsable');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
            <UserPlus className="size-6" />
            Nuevo Responsable
          </DialogTitle>
          <DialogDescription className="font-medium">
            Registrá a un nuevo responsable para tu laboratorio.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre"
                        className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apellido"
                        className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@email.com"
                      className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contraseña temporal</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Mínimo 8 caracteres"
                      className="bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-6 mt-4 font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Registrando...' : 'Registrar Responsable'}
              <UserPlus className="ml-2 size-4" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
