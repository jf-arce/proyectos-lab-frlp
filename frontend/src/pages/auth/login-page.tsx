import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { Landmark, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function LoginPage() {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blobs atmosféricos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-card rounded-xl shadow-[0_32px_64px_-12px_rgba(0,36,75,0.08)] overflow-hidden z-10">
        {/* ── Panel de branding ── */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="login-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#login-grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              {/* <Landmark className="size-8" strokeWidth={1.5} />
              <span className="text-xl font-extrabold tracking-tighter uppercase font-display">
                UTN FRLP
              </span> */}
              <picture>
                <img
                  src="/images/utn-logo.png"
                  alt="Logo de UTN FRLP"
                  className="h-10 w-auto invert dark:invert-0"
                />
              </picture>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-6 font-display">
              Gestión de Proyectos y Laboratorios
            </h1>
            <p className="text-primary-foreground/70 text-lg font-medium max-w-sm leading-relaxed">
              Acceso exclusivo para docentes, investigadores y alumnos de la
              Facultad Regional La Plata.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-primary-foreground/40 font-medium tracking-wide uppercase">
                Universidad Tecnológica Nacional
              </p>
            </div>
          </div>
        </div>

        {/* ── Panel de formulario ── */}
        <div className="p-8 md:p-14 flex flex-col justify-center">
          {/* Logo mobile */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-10">
            <Landmark className="size-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-extrabold tracking-tighter text-primary font-display">
              UTN FRLP
            </span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-primary mb-2 font-display">
              Bienvenido
            </h2>
            <p className="text-muted-foreground font-medium">
              Ingresá tus credenciales institucionales
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
                      <Input
                        type="password"
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
      </div>
    </div>
  );
}
