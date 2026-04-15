import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  email: z.email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type FormValues = z.infer<typeof schema>;

function roleHome(role: string) {
  return role === Role.RESPONSABLE_LABORATORIO
    ? '/responsable/dashboard'
    : '/alumno/dashboard';
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      const user = await login(values.email, values.password);
      toast.success(`¡Bienvenido, ${user.email}!`);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al iniciar sesión',
      );
    }
  }

  return (
    <div className="p-8 md:p-14 flex flex-col justify-center">
      {/* Logo mobile */}
      <div className="md:hidden flex items-center justify-center gap-2 mb-10">
        <picture>
          <img
            src="/images/utn-logo.png"
            alt="Logo de UTN FRLP"
            className="h-10 w-auto invert-0 dark:invert"
          />
        </picture>
      </div>

      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-primary mb-2 font-display">
          Bienvenido
        </h2>
        <p className="text-muted-foreground font-medium">
          Ingresá tus credenciales
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Contraseña</FormLabel>
                  <a
                    href="#"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <FormControl>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full py-6"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Ingresando...'
              : 'Ingresar al Portal'}
            <LogIn className="size-4" />
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
              O continuá con
            </span>
          </div>
        </div>

        <Button variant="secondary" className="w-full" asChild>
          <Link to="/register" className="py-6">
            <UserPlus className="size-4" />
            Crear cuenta de alumno
          </Link>
        </Button>
      </div>
    </div>
  );
}
